# services.py
import re

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from django.conf import settings
from unipage.models import University, NtcProgram, UniversityProgram, FieldOfStudy
from announcements.models import GrantWinner


# Создаём один раз при старте
_llm = None

def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.7,
        )
    return _llm


def get_context_from_db(question: str) -> str:
    q = question.lower()
    context = []

    # --- Конкретный университет по названию или коду ---
    universities = University.objects.all()
    matched_uni = None
    for u in universities:
        if u.name.lower() in q or u.code.lower() in q:
            matched_uni = u
            break

    if matched_uni:
        programs = UniversityProgram.objects.filter(
            university=matched_uni
        ).select_related('ntc_program__field_of_study', 'language')

        prog_lines = []
        for p in programs:
            lang = p.language.name if p.language else '—'
            score = p.passing_score if p.passing_score else '—'
            grant = p.grant_score if p.grant_score else '—'
            prog_lines.append(
                f"  • {p.local_name} | стоимость: {p.cost:,} тг | "
                f"проходной: {score} | грант: {grant} | язык: {lang}"
            )

        context.append(
            f"Университет: {matched_uni.name}\n"
            f"Город: {matched_uni.city}\n"
            f"Адрес: {matched_uni.address}\n"
            f"Телефон: {matched_uni.phone}\n"
            f"Email: {matched_uni.email}\n"
            f"Общий проходной балл: {matched_uni.passing_score}\n"
            f"Программы:\n" + ("\n".join(prog_lines) if prog_lines else "  нет данных")
        )

    # --- Фильтр по городу ---
    city_map = {
        'алматы': 'Алматы', 'almaty': 'Алматы',
        'астана': 'Астана', 'astana': 'Астана', 'нур-султан': 'Астана',
        'шымкент': 'Шымкент', 'shimkent': 'Шымкент',
        'караганда': 'Қарағанды', 'karaganda': 'Қарағанды',
        'актобе': 'Ақтөбе', 'павлодар': 'Павлодар',
    }
    for keyword, city_name in city_map.items():
        if keyword in q:
            unis = University.objects.filter(city__icontains=city_name)
            if unis.exists():
                lines = [
                    f"  • {u.name} | проходной: {u.passing_score} | тел: {u.phone}"
                    for u in unis
                ]
                context.append(f"Университеты в городе {city_name}:\n" + "\n".join(lines))
            break

    # --- Фильтр по специальности / направлению ---
    program_keywords = ['программа', 'специальность', 'направление', 'профессия',
                        'it', 'медицин', 'инженер', 'экономик', 'юрид', 'педагог',
                        'программирован', 'software', 'данные', 'data', 'финанс']
    if any(kw in q for kw in program_keywords) and not matched_uni:
        # Ищем подходящие NTC программы по названию
        all_programs = NtcProgram.objects.select_related('field_of_study').all()
        matched = [p for p in all_programs if any(word in p.name.lower() for word in q.split())]

        if not matched:
            matched = list(all_programs[:15])

        lines = []
        for p in matched[:15]:
            # Сколько университетов предлагают эту программу
            uni_count = UniversityProgram.objects.filter(ntc_program=p).count()
            lines.append(f"  • {p.name} ({p.field_of_study.name}) — доступна в {uni_count} вузах")

        context.append("Образовательные программы:\n" + "\n".join(lines))

    # --- Общий список университетов если ничего конкретного ---
    general_keywords = ['университет', 'вуз', 'универ', 'university', 'куда поступить',
                        'список', 'все вузы', 'какие вузы']
    if any(kw in q for kw in general_keywords) and not matched_uni:
        unis = University.objects.all()
        lines = [
            f"  • {u.name} ({u.city}) | проходной: {u.passing_score}"
            for u in unis
        ]
        context.append("Все университеты на платформе:\n" + "\n".join(lines))

    # --- Вопрос про стоимость/гранты ---
    if any(kw in q for kw in ['стоимост', 'цена', 'сколько стоит', 'грант', 'платно', 'бесплатно']):
        programs = UniversityProgram.objects.select_related(
            'university', 'ntc_program'
        ).order_by('cost')[:20]
        lines = [
            f"  • {p.university.name} — {p.local_name}: {p.cost:,} тг"
            + (f" | грант от {p.grant_score} б." if p.grant_score else "")
            for p in programs
        ]
        context.append("Стоимость обучения (от дешёвых к дорогим):\n" + "\n".join(lines))

    ikt_match = re.search(r'\b(\d{9})\b', question)
    if ikt_match:
        ikt = ikt_match.group(1)
        winners = GrantWinner.objects.filter(ikt=ikt)
        if winners.exists():
            w = winners.first()
            context.append(
                f"Результат по ИКТ {ikt}:\n"
                f"  ФИО: {w.full_name}\n"
                f"  Специальность: {w.field_name} ({w.field_code})\n"
                f"  Балл: {w.score}\n"
                f"  Код ОВПО: {w.university_code}\n"
                f"  Год: {w.year}"
            )
        else:
            context.append(f"По ИКТ {ikt} грант не найден в базе 2025 года.")

    # Статистика по специальности
    if any(kw in q for kw in ['грант', 'гранты', 'проходной', 'сколько баллов']):
        from django.db.models import Min, Max, Count
        stats = GrantWinner.objects.values('field_code', 'field_name').annotate(
            min_score=Min('score'), max_score=Max('score'), total=Count('id')
        ).order_by('field_code')[:20]
        lines = [f"  • {s['field_name']}: мин {s['min_score']} — макс {s['max_score']} б. ({s['total']} грантников)" for
                 s in stats]
        context.append("Статистика по грантам 2025:\n" + "\n".join(lines))

    return "\n\n".join(context) if context else ""


SYSTEM_PROMPT = """Ты — Bilimge Assistant, умный помощник абитуриента на платформе Bilimge.kz.

Твоя цель — помочь казахстанским абитуриентам выбрать университет и образовательную программу.

Что ты умеешь:
- Рассказывать про университеты Казахстана: город, проходной балл, стоимость, программы
- Помогать выбрать специальность исходя из интересов и баллов ЕНТ
- Объяснять разницу между грантом и платным обучением
- Сравнивать университеты между собой
- Отвечать на вопросы про поступление в Казахстане

Правила:
- Отвечай на том языке, на котором пишет пользователь (казахский, русский или английский)
- Если в данных ниже нет нужной информации — честно скажи об этом и предложи зайти на сайт университета
- Не выдумывай данные — используй только то, что есть в базе
- Будь дружелюбным, конкретным и лаконичным
- Если пользователь называет свой балл ЕНТ — сразу предложи подходящие варианты из данных
"""


def get_ai_response(user_message: str, chat_history: list) -> str:
    try:
        llm = get_llm()
        db_context = get_context_from_db(user_message)

        system = SYSTEM_PROMPT
        if db_context:
            system += f"\n\nАктуальные данные из базы:\n{db_context}"
        else:
            system += "\n\nДанные по этому запросу не найдены в базе — отвечай на основе общих знаний о системе образования Казахстана."

        messages = [SystemMessage(content=system)]

        # История — берём последние 10 сообщений чтобы не раздувать контекст
        for msg in chat_history[-10:]:
            if msg['role'] == 'user':
                messages.append(HumanMessage(content=msg['content']))
            elif msg['role'] == 'assistant':
                messages.append(AIMessage(content=msg['content']))

        messages.append(HumanMessage(content=user_message))

        response = llm.invoke(messages)
        return response.content

    except Exception as e:
        return "Извините, произошла ошибка. Попробуйте повторить вопрос чуть позже."