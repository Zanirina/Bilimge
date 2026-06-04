# services.py
import re

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from django.conf import settings
from unipage.models import University, NtcProgram, UniversityProgram, FieldOfStudy
from announcements.models import GrantWinner


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


# ── IT / tech field detection ─────────────────────────────────────────────────
IT_KEYWORDS = [
    'it', 'software', 'computer', 'программир', 'информатик', 'cs',
    'computing', 'tech', 'цифр', 'digital', 'кибер', 'cyber', 'робот',
    'robot', 'ai', 'data', 'данные', 'machine learning', 'web', 'mobile',
    'разработк', 'developer', 'инженер-программ',
]

IT_FIELD_KEYWORDS = [
    'information technology', 'computer', 'informatics', 'software',
    'computing', 'cybersecurity', 'telecommunications', 'communications',
]

SUBJECT_KEYWORDS = [
    'subject', 'предмет', 'экзамен', 'exam', 'test', 'which subject',
    'какой предмет', 'какие предметы', 'required', 'нужно', 'нужны',
    'поступ', 'admission', 'вступительн', 'что сдавать', 'сдавать',
]

DORM_KEYWORDS = [
    'dorm', 'общежит', 'housing', 'жилье', 'жильё', 'жить',
    'accommodation', 'проживан',
]

MILITARY_KEYWORDS = [
    'military', 'военн', 'воен', 'кафедр', 'military department',
]


def _uni_detail(u: University) -> str:
    parts = [
        f"Название: {u.name}",
        f"Город: {u.city}",
    ]
    if u.passing_score:
        parts.append(f"Проходной балл ЕНТ: {u.passing_score}")
    if u.tuition_cost:
        parts.append(f"Стоимость обучения: {u.tuition_cost:,} тг/год")
    if u.has_dormitory is not None:
        parts.append(f"Общежитие: {'есть' if u.has_dormitory else 'нет'}")
    if u.has_military_department is not None:
        parts.append(f"Военная кафедра: {'есть' if u.has_military_department else 'нет'}")
    if u.website:
        parts.append(f"Сайт: {u.website}")
    if u.phone:
        parts.append(f"Телефон: {u.phone}")
    if u.email:
        parts.append(f"Email: {u.email}")
    return "\n".join(parts)


def _program_detail(p: NtcProgram) -> str:
    parts = [f"  • [{p.code}] {p.name}"]
    sub1 = str(p.subject_1) if p.subject_1 else None
    sub2 = str(p.subject_2) if p.subject_2 else None
    subs = " + ".join(filter(None, [sub1, sub2]))
    if subs:
        parts.append(f"    Вступительные предметы: {subs}")
    if p.minimum_score:
        parts.append(f"    Минимальный балл: {p.minimum_score}")
    return "\n".join(parts)


def _uni_program_detail(up: UniversityProgram) -> str:
    parts = [f"  • {up.local_name}"]
    if up.passing_score:
        parts.append(f"    Проходной балл: {up.passing_score}")
    if up.grant_score:
        parts.append(f"    Грантовый балл: {up.grant_score}")
    if up.cost:
        parts.append(f"    Стоимость: {up.cost:,} тг/год")
    lang = up.language.name if up.language else None
    if lang:
        parts.append(f"    Язык обучения: {lang}")
    if up.future_professions:
        parts.append(f"    Профессии: {up.future_professions[:120]}")
    return "\n".join(parts)


def get_context_from_db(question: str) -> str:
    q = question.lower()
    context = []

    # ── 1. Specific university by name ────────────────────────────────────────
    matched_uni = None
    for u in University.objects.all():
        if u.name.lower() in q or (u.short_name and u.short_name.lower() in q):
            matched_uni = u
            break

    if matched_uni:
        context.append("Информация об университете:\n" + _uni_detail(matched_uni))

        uni_programs = UniversityProgram.objects.filter(
            university=matched_uni
        ).select_related('ntc_program__field_of_study', 'ntc_program__subject_1', 'ntc_program__subject_2', 'language')

        if uni_programs.exists():
            prog_lines = [_uni_program_detail(up) for up in uni_programs]
            context.append("Программы этого университета:\n" + "\n".join(prog_lines))
        else:
            ntc_by_field = {}
            for field in FieldOfStudy.objects.all():
                progs = NtcProgram.objects.filter(field_of_study=field)[:5]
                if progs:
                    ntc_by_field[field.name] = progs

    # ── 2. City filter ────────────────────────────────────────────────────────
    city_map = {
        'алматы': 'Алматы', 'almaty': 'Алматы',
        'астана': 'Астана', 'astana': 'Астана', 'нур-султан': 'Астана', 'nursultan': 'Астана',
        'шымкент': 'Шымкент', 'shimkent': 'Шымкент', 'shymkent': 'Шымкент',
        'қарағанды': 'Қарағанды', 'karaganda': 'Қарағанды', 'караганда': 'Қарағанды',
        'ақтөбе': 'Ақтөбе', 'актобе': 'Ақтөбе', 'aktobe': 'Ақтөбе',
        'павлодар': 'Павлодар', 'pavlodar': 'Павлодар',
        'өскемен': 'Өскемен', 'оскемен': 'Өскемен', 'ust-kamenogorsk': 'Өскемен',
        'атырау': 'Атырау', 'atyrau': 'Атырау',
        'актау': 'Актау', 'aktau': 'Актау',
        'қостанай': 'Қостанай', 'костанай': 'Қостанай', 'kostanay': 'Қостанай',
    }
    for keyword, city_name in city_map.items():
        if keyword in q:
            unis = University.objects.filter(city__icontains=city_name)
            if unis.exists():
                lines = []
                for u in unis:
                    line = f"  • {u.name}"
                    if u.passing_score:
                        line += f" | проходной: {u.passing_score}"
                    if u.tuition_cost:
                        line += f" | стоимость: {u.tuition_cost:,} тг"
                    if u.has_dormitory:
                        line += " | общежитие: есть"
                    lines.append(line)
                context.append(f"Университеты в городе {city_name} ({unis.count()} вузов):\n" + "\n".join(lines))
            break

    # ── 3. Required subjects / admission questions ────────────────────────────
    is_subject_query = any(kw in q for kw in SUBJECT_KEYWORDS)
    is_it_query = any(kw in q for kw in IT_KEYWORDS)

    if is_subject_query or is_it_query:
        # Find relevant NTC programs
        if is_it_query:
            # IT-specific: search by field name
            it_fields = FieldOfStudy.objects.filter(
                name__icontains='Information'
            ) | FieldOfStudy.objects.filter(
                name__icontains='Computer'
            ) | FieldOfStudy.objects.filter(
                name__icontains='Informatics'
            ) | FieldOfStudy.objects.filter(
                name__icontains='Communications'
            ) | FieldOfStudy.objects.filter(
                name__icontains='Software'
            ) | FieldOfStudy.objects.filter(
                name__icontains='Cyber'
            )
            it_progs = NtcProgram.objects.filter(field_of_study__in=it_fields)

            # Also search by program name
            name_matches = NtcProgram.objects.filter(
                name__icontains='Informatics'
            ) | NtcProgram.objects.filter(
                name__icontains='Computer'
            ) | NtcProgram.objects.filter(
                name__icontains='Software'
            ) | NtcProgram.objects.filter(
                name__icontains='Information'
            )

            all_progs = (it_progs | name_matches).distinct().select_related('subject_1', 'subject_2', 'field_of_study')
        else:
            # General subject query — try to find programs matching keywords
            words = [w for w in q.split() if len(w) > 3]
            all_progs = NtcProgram.objects.none()
            for word in words:
                all_progs = all_progs | NtcProgram.objects.filter(name__icontains=word)
            all_progs = all_progs.distinct().select_related('subject_1', 'subject_2', 'field_of_study')
            if not all_progs.exists():
                all_progs = NtcProgram.objects.select_related('subject_1', 'subject_2').all()[:20]

        if all_progs.exists():
            lines = [_program_detail(p) for p in all_progs[:20]]
            label = "IT/CS образовательные программы и вступительные предметы" if is_it_query else "Образовательные программы и вступительные предметы"
            context.append(f"{label}:\n" + "\n".join(lines))

        if is_it_query and not matched_uni:
            uni_progs = UniversityProgram.objects.filter(
                ntc_program__in=all_progs
            ).select_related('university', 'ntc_program', 'language') if all_progs.exists() else UniversityProgram.objects.none()

            uni_progs_by_name = UniversityProgram.objects.filter(
                local_name__icontains='IT'
            ) | UniversityProgram.objects.filter(
                local_name__icontains='Computer'
            ) | UniversityProgram.objects.filter(
                local_name__icontains='Software'
            ) | UniversityProgram.objects.filter(
                local_name__icontains='Artificial Intelligence'
            ) | UniversityProgram.objects.filter(
                local_name__icontains='Data'
            )

            all_uni_progs = (uni_progs | uni_progs_by_name).select_related(
                'university', 'ntc_program', 'language'
            ).distinct()[:20]

            if all_uni_progs.exists():
                lines = []
                for up in all_uni_progs:
                    line = f"  • {up.university.name} — {up.local_name}"
                    if up.passing_score:
                        line += f" | проходной: {up.passing_score}"
                    if up.grant_score:
                        line += f" | грант: {up.grant_score}"
                    if up.cost:
                        line += f" | стоимость: {up.cost:,} тг"
                    lines.append(line)
                context.append("IT программы в университетах:\n" + "\n".join(lines))

    # ── 4. Dormitory / housing query ──────────────────────────────────────────
    if any(kw in q for kw in DORM_KEYWORDS):
        unis = University.objects.filter(has_dormitory=True)
        if unis.exists():
            lines = [f"  • {u.name} ({u.city})" for u in unis[:30]]
            context.append(f"Университеты с общежитием ({unis.count()} вузов):\n" + "\n".join(lines))

    # ── 5. Military department query ──────────────────────────────────────────
    if any(kw in q for kw in MILITARY_KEYWORDS):
        unis = University.objects.filter(has_military_department=True)
        if unis.exists():
            lines = [f"  • {u.name} ({u.city})" for u in unis[:20]]
            context.append(f"Университеты с военной кафедрой ({unis.count()} вузов):\n" + "\n".join(lines))

    # ── 6. General university list ────────────────────────────────────────────
    general_keywords = [
        'университет', 'вуз', 'универ', 'university', 'куда поступить',
        'список', 'все вузы', 'какие вузы', 'which universities', 'universities',
    ]
    if any(kw in q for kw in general_keywords) and not matched_uni:
        unis = University.objects.all()
        lines = []
        for u in unis:
            line = f"  • {u.name} ({u.city})"
            if u.passing_score:
                line += f" | проходной: {u.passing_score}"
            if u.tuition_cost:
                line += f" | стоимость: {u.tuition_cost:,} тг"
            lines.append(line)
        context.append(f"Все университеты на платформе ({unis.count()} вузов):\n" + "\n".join(lines))

    # ── 7. Cost / grant price query ───────────────────────────────────────────
    if any(kw in q for kw in ['стоимост', 'цена', 'сколько стоит', 'платно', 'бесплатно', 'cost', 'tuition', 'price']):
        progs = UniversityProgram.objects.select_related(
            'university', 'ntc_program'
        ).order_by('cost')[:20]
        if progs.exists():
            lines = [
                f"  • {p.university.name} — {p.local_name}: {p.cost:,} тг"
                + (f" | грант от {p.grant_score} б." if p.grant_score else "")
                for p in progs
            ]
            context.append("Стоимость обучения (от дешёвых к дорогим):\n" + "\n".join(lines))

        # Also show universities with tuition_cost
        unis_cost = University.objects.filter(tuition_cost__isnull=False).order_by('tuition_cost')[:20]
        if unis_cost.exists():
            lines = [
                f"  • {u.name} ({u.city}): {u.tuition_cost:,} тг/год"
                for u in unis_cost
            ]
            context.append("Стоимость обучения в университетах (в год):\n" + "\n".join(lines))

    # ── 8. Grant check by IKT number ─────────────────────────────────────────
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

    # ── 9. Grant statistics ───────────────────────────────────────────────────
    if any(kw in q for kw in ['грант', 'grant', 'гранты', 'grants', 'проходной балл', 'passing score']):
        from django.db.models import Min, Max, Count
        stats = (
            GrantWinner.objects.values('field_code', 'field_name')
            .annotate(min_score=Min('score'), max_score=Max('score'), total=Count('id'))
            .order_by('field_code')[:20]
        )
        if stats:
            lines = [
                f"  • {s['field_name']}: мин {s['min_score']} — макс {s['max_score']} б. ({s['total']} грантников)"
                for s in stats
            ]
            context.append("Статистика по грантам 2025:\n" + "\n".join(lines))

    return "\n\n".join(context) if context else ""


SYSTEM_PROMPT = """Ты — Bilimge Assistant, умный помощник абитуриента на платформе Bilimge.kz.

Твоя цель — помочь казахстанским абитуриентам выбрать университет и образовательную программу.

Что ты умеешь:
- Рассказывать про университеты Казахстана: город, проходной балл, стоимость, программы, общежитие, военная кафедра
- Показывать вступительные предметы (subject_1, subject_2) для каждой специальности НТЦ
- Показывать минимальный балл ЕНТ для поступления
- Помогать выбрать специальность исходя из интересов и баллов ЕНТ
- Объяснять разницу между грантом и платным обучением
- Сравнивать университеты между собой
- Отвечать на вопросы про поступление в Казахстане

Правила:
- Отвечай на том языке, на котором пишет пользователь (казахский, русский или английский)
- ВСЕГДА используй данные из базы, если они предоставлены ниже
- Если в данных есть вступительные предметы (subject_1, subject_2) — ОБЯЗАТЕЛЬНО укажи их
- Если в данных есть минимальный балл — укажи его
- Если данных нет — честно скажи об этом и посоветуй проверить на сайте университета или ntc.edu.kz
- Не выдумывай данные — используй только то, что есть в базе
- Будь дружелюбным, конкретным и структурированным
- Если пользователь называет свой балл ЕНТ — сразу предложи подходящие варианты из данных
- При перечислении программ всегда показывай вступительные предметы, если они есть
"""


def get_ai_response(user_message: str, chat_history: list) -> str:
    try:
        llm = get_llm()
        db_context = get_context_from_db(user_message)

        system = SYSTEM_PROMPT
        if db_context:
            system += f"\n\nАктуальные данные из базы:\n{db_context}"
        else:
            system += (
                "\n\nДанные по этому запросу не найдены в базе — отвечай на основе "
                "общих знаний о системе образования Казахстана и порекомендуй проверить "
                "на ntc.edu.kz или на официальном сайте университета."
            )

        messages = [SystemMessage(content=system)]

        for msg in chat_history[-10:]:
            if msg['role'] == 'user':
                messages.append(HumanMessage(content=msg['content']))
            elif msg['role'] == 'assistant':
                messages.append(AIMessage(content=msg['content']))

        messages.append(HumanMessage(content=user_message))

        response = llm.invoke(messages)
        return response.content

    except Exception as e:
        raise  # re-raise so the view can log/return proper error
