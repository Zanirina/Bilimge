from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from django.conf import settings
from unipage.models import University, NtcProgram, UniversityProgram


def get_context_from_db(question: str) -> str:
    """Получаем релевантные данные из БД для ответа"""
    context = []

    question_lower = question.lower()

    # если спрашивают про университеты
    if any(word in question_lower for word in ['университет', 'вуз', 'универ', 'university']):
        universities = University.objects.all()[:10]
        uni_list = "\n".join([
            f"- {u.name} ({u.city}), проходной балл: {u.passing_score}"
            for u in universities
        ])
        context.append(f"Список университетов:\n{uni_list}")

    # если спрашивают про программы/специальности
    if any(word in question_lower for word in ['программа', 'специальность', 'направление', 'it', 'информатика']):
        programs = NtcProgram.objects.all()[:20]
        prog_list = "\n".join([f"- {p.name}" for p in programs])
        context.append(f"Список специальностей:\n{prog_list}")

    # если спрашивают про город
    cities = ['алматы', 'астана', 'шымкент', 'караганда']
    for city in cities:
        if city in question_lower:
            unis = University.objects.filter(city__icontains=city)
            uni_list = "\n".join([f"- {u.name}" for u in unis])
            context.append(f"Университеты в городе {city.capitalize()}:\n{uni_list}")
            break

    return "\n\n".join(context) if context else ""


def get_ai_response(user_message: str, chat_history: list) -> str:
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile",
        temperature=0.7,
    )

    # получаем данные из БД
    db_context = get_context_from_db(user_message)

    # системный промпт
    system_prompt = """Ты помощник абитуриента на платформе Bilimge. 
Ты помогаешь выбрать университет и специальность в Казахстане.
Отвечай на казахском или русском языке или английском в зависимости от того на каком языке пишет пользователь.
Будь дружелюбным и полезным.
"""

    if db_context:
        system_prompt += f"\n\nАктуальные данные из базы:\n{db_context}"

    messages = [SystemMessage(content=system_prompt)]

    # добавляем историю переписки
    for msg in chat_history:
        if msg['role'] == 'user':
            messages.append(HumanMessage(content=msg['content']))
        else:
            messages.append(AIMessage(content=msg['content']))

    # добавляем новый вопрос
    messages.append(HumanMessage(content=user_message))

    response = llm.invoke(messages)
    return response.content