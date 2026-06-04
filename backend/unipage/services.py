from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from django.conf import settings

_llm = None

def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.5,
        )
    return _llm

LANGUAGE_INSTRUCTIONS = {
    'en': "Respond in English.",
    'ru': "Отвечай на русском языке.",
    'kk': "Қазақ тілінде жауап бер.",
}

LANGUAGE_ADDRESS = {
    'en': "Address the reader as 'you'.",
    'ru': "Обращайся к читателю на 'вы'.",
    'kk': "Оқырманға 'сіз' деп жүгін.",
}


def get_comparison_ai_analysis(universities, language: str = 'en') -> str:
    try:
        llm = get_llm()

        lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS['en'])
        lang_address = LANGUAGE_ADDRESS.get(language, LANGUAGE_ADDRESS['en'])

        uni_blocks = []
        for u in universities:
            programs_count = u.programs.count()
            accreditations = [a.name for a in u.accreditations.all()]
            mobility_count = u.academic_mobility.count()
            languages = [ul.language.name for ul in u.teaching_languages.select_related('language').all()]

            block = f"""
University: {u.name} ({u.city})
- Founded: {u.year_established or '—'}
- UNT minimum: {u.passing_score or '—'}
- Tuition: {f"{u.tuition_cost:,} KZT/year" if u.tuition_cost else '—'}
- Programs: {programs_count}
- Languages: {', '.join(languages) if languages else '—'}
- Accreditations: {', '.join(accreditations) if accreditations else 'none'}
- International partners: {mobility_count}
- Dormitory: {'yes' if u.has_dormitory else 'no'}
- Military dept: {'yes' if u.has_military_department else 'no'}
""".strip()
            uni_blocks.append(block)

        unis_text = "\n\n".join(uni_blocks)

        prompt = f"""Compare these {len(universities)} universities in Kazakhstan:

{unis_text}

Write an analytical summary (4-6 sentences) for a prospective student:
1. Briefly highlight the strengths of each university
2. Say which university suits which type of student
3. Give an overall recommendation

{lang_instruction} {lang_address} Be specific and objective."""

        response = llm.invoke([
            SystemMessage(content=f"You are an expert consultant helping students choose a university in Kazakhstan. Give balanced, objective comparisons. {lang_instruction}"),
            HumanMessage(content=prompt)
        ])
        return response.content

    except Exception:
        return ""