from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from django.conf import settings
from unipage.models import NtcProgram, UniversityProgram
from announcements.models import GrantWinner
from django.db.models import Min, Max, Avg, Count

_llm = None

def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.3,
        )
    return _llm


MIN_SCORE_BY_TYPE = {
    'law':         75,
    'pedagogy':    75,
    'medicine':    70,
    'agriculture': 50,
    'national':    65,
    'default':     50,
}

# Маппинг field_of_study.code (int) → тип специальности
FIELD_TYPE_MAP = {
    1: 'pedagogy', 2: 'pedagogy', 3: 'pedagogy', 4: 'pedagogy',
    5: 'pedagogy', 6: 'pedagogy', 7: 'pedagogy', 9: 'pedagogy',
    10: 'pedagogy', 11: 'pedagogy', 12: 'pedagogy', 13: 'pedagogy',
    14: 'pedagogy', 15: 'pedagogy', 16: 'pedagogy', 17: 'pedagogy',
    60: 'medicine', 61: 'medicine', 62: 'medicine',
    80: 'agriculture', 81: 'agriculture', 82: 'agriculture',
}

QUOTA_BONUS = {
    'rural':             0.07,
    'large_family':      0.05,
    'incomplete_family': 0.04,
    'serpin':            0.08,
    'disability':        0.06,
    'family_disability': 0.05,
    'orphan':            0.07,
}


def field_code_int_to_grant_code(field_code_int) -> str:
    """Конвертирует числовой код поля (1) в формат грантников (B001)"""
    return f"B{int(field_code_int):03d}"


def get_field_type(field_code_int) -> str:
    return FIELD_TYPE_MAP.get(int(field_code_int), 'default')


def calculate_total_score(scores: dict) -> int:
    return (
        scores.get('history', 0) +
        scores.get('math_literacy', 0) +
        scores.get('reading_literacy', 0) +
        scores.get('subject_1', 0) +
        scores.get('subject_2', 0)
    )


def check_minimum_scores(scores: dict, field_type: str) -> tuple[bool, str]:
    min_total = MIN_SCORE_BY_TYPE.get(field_type, 50)
    total = calculate_total_score(scores)

    if scores.get('history', 0) < 5:
        return False, 'Минимальный балл по Истории Казахстана — 5'
    if scores.get('subject_1', 0) < 5:
        return False, 'Минимальный балл по профильному предмету 1 — 5'
    if scores.get('subject_2', 0) < 5:
        return False, 'Минимальный балл по профильному предмету 2 — 5'
    if scores.get('math_literacy', 0) < 3:
        return False, 'Минимальный балл по Математической грамотности — 3'
    if scores.get('reading_literacy', 0) < 3:
        return False, 'Минимальный балл по Грамотности чтения — 3'
    if total < min_total:
        return False, f'Минимальный общий балл для этой специальности — {min_total}'

    return True, 'OK'


def get_grant_stats_from_winners(field_code_int) -> dict:
    """Берёт реальную статистику из базы грантников 2025"""
    grant_code = field_code_int_to_grant_code(field_code_int)
    stats = GrantWinner.objects.filter(
        field_code=grant_code, year=2025
    ).aggregate(
        min_score=Min('score'),
        max_score=Max('score'),
        avg_score=Avg('score'),
        total=Count('id')
    )
    return stats


def calculate_grant_chance(total_score: int, grant_score: int, quotas: list) -> float:
    """Шанс на грант по конкретному grant_score из БД"""
    if grant_score is None or grant_score == 0:
        return 0.0

    diff = total_score - grant_score

    if diff >= 20:
        base_chance = 95.0
    elif diff >= 10:
        base_chance = 80.0
    elif diff >= 5:
        base_chance = 65.0
    elif diff >= 0:
        base_chance = 45.0
    elif diff >= -5:
        base_chance = 25.0
    elif diff >= -10:
        base_chance = 10.0
    else:
        base_chance = 2.0

    quota_bonus = sum(QUOTA_BONUS.get(q, 0) for q in quotas) * 100
    return round(min(98.0, base_chance + quota_bonus), 1)


def calculate_grant_chance_by_winners(total_score: int, field_code_int, quotas: list) -> float:
    """Шанс на грант по статистике реальных грантников 2025"""
    stats = get_grant_stats_from_winners(field_code_int)

    if not stats['total']:
        return 0.0

    min_score = stats['min_score']
    max_score = stats['max_score']
    avg_score = stats['avg_score']

    if total_score >= max_score:
        base_chance = 95.0
    elif total_score >= avg_score:
        base_chance = 50.0 + 45.0 * (total_score - avg_score) / (max_score - avg_score)
    elif total_score >= min_score:
        base_chance = 10.0 + 40.0 * (total_score - min_score) / (avg_score - min_score)
    else:
        base_chance = max(2.0, 10.0 * total_score / min_score)

    quota_bonus = sum(QUOTA_BONUS.get(q, 0) for q in quotas) * 100
    return round(min(98.0, base_chance + quota_bonus), 1)


def get_programs_for_subjects(subject_1_id: int, subject_2_id: int):
    return (
        NtcProgram.objects.filter(
            subject_1_id=subject_1_id, subject_2_id=subject_2_id
        ).select_related('field_of_study') |
        NtcProgram.objects.filter(
            subject_1_id=subject_2_id, subject_2_id=subject_1_id
        ).select_related('field_of_study')
    )


def get_ai_analysis(total_score: int, results: list, quotas: list, ntc_program_name: str) -> str:
    try:
        llm = get_llm()

        top_unis = results[:5]
        unis_text = "\n".join([
            f"- {r['university_name']} ({r['university_city']}): "
            f"шанс на грант {r['grant_chance']}%, "
            f"грант-балл {r['grant_score'] or 'нет данных'}, "
            f"источник: {r['data_source']}"
            for r in top_unis
        ])

        prompt = f"""Абитуриент набрал {total_score} баллов ЕНТ по специальности "{ntc_program_name}".
Квоты: {', '.join(quotas) if quotas else 'нет'}.

Топ университетов по шансу на грант:
{unis_text}

Напиши краткий анализ (3-4 предложения) обращаясь к абитуриенту на "Вы".
Например: "С вашим баллом...", "У вас есть шанс...", "Вам рекомендуется..."
Отвечай на английском языке. Будь конкретным и позитивным но честным.
Если данные взяты из статистики грантников (grant_winners_2025) — это реальные данные прошлого года."""

        response = llm.invoke([
            SystemMessage(content="Ты эксперт по поступлению в казахстанские университеты. Давай краткие, честные оценки."),
            HumanMessage(content=prompt)
        ])
        return response.content
    except Exception:
        return ""


def calculate_chances(data: dict) -> dict:
    subject_1_id = data.get('subject_1_id')
    subject_2_id = data.get('subject_2_id')
    scores = data.get('scores', {})
    quotas = data.get('quotas', [])
    ntc_program_code = data.get('ntc_program_code')

    total_score = calculate_total_score(scores)

    try:
        if ntc_program_code:
            ntc_program = NtcProgram.objects.select_related('field_of_study').get(code=ntc_program_code)
        else:
            ntc_programs = get_programs_for_subjects(subject_1_id, subject_2_id)
            if not ntc_programs.exists():
                return {'error': 'Программы по этим предметам не найдены'}
            ntc_program = ntc_programs.first()
    except NtcProgram.DoesNotExist:
        return {'error': 'НТЦ программа не найдена'}

    field_code_int = ntc_program.field_of_study.code
    field_type = get_field_type(field_code_int)

    passed, message = check_minimum_scores(scores, field_type)
    if not passed:
        return {
            'passed_minimum': False,
            'message': message,
            'total_score': total_score,
        }

    grant_stats = get_grant_stats_from_winners(field_code_int)

    uni_programs = UniversityProgram.objects.filter(
        ntc_program=ntc_program
    ).select_related('university', 'language')

    results = []
    for up in uni_programs:
        if up.grant_score:
            grant_chance = calculate_grant_chance(total_score, up.grant_score, quotas)
            data_source = 'grant_score'
        else:
            grant_chance = calculate_grant_chance_by_winners(total_score, field_code_int, quotas)
            data_source = 'grant_winners_2025'

        if up.passing_score:
            admission_chance = calculate_grant_chance(total_score, up.passing_score, quotas)
        else:
            admission_chance = round(min(98.0, grant_chance + 15.0), 1)

        results.append({
            'university_code': up.university.code,
            'university_name': up.university.name,
            'university_city': up.university.city,
            'program_code': up.code,
            'program_name': up.local_name,
            'grant_score': up.grant_score,
            'passing_score': up.passing_score,
            'grant_chance': grant_chance,
            'admission_chance': admission_chance,
            'language': up.language.name if up.language else '—',
            'data_source': data_source,
        })

    results.sort(key=lambda x: x['grant_chance'], reverse=True)

    best_chance = results[0]['grant_chance'] if results else 0
    avg_chance = round(sum(r['grant_chance'] for r in results) / len(results), 1) if results else 0

    ai_analysis = get_ai_analysis(total_score, results, quotas, ntc_program.name)

    grant_stats_info = None
    if grant_stats['total']:
        grant_code = field_code_int_to_grant_code(field_code_int)
        grant_stats_info = {
            'field_code': grant_code,
            'min_score': grant_stats['min_score'],
            'max_score': grant_stats['max_score'],
            'avg_score': round(grant_stats['avg_score'], 1),
            'total_winners': grant_stats['total'],
            'year': 2025,
        }

    return {
        'passed_minimum': True,
        'total_score': total_score,
        'best_grant_chance': best_chance,
        'average_grant_chance': avg_chance,
        'ntc_program': {
            'code': ntc_program.code,
            'name': ntc_program.name,
            'field': ntc_program.field_of_study.name,
            'field_code': str(field_code_int),
            'grant_code': field_code_int_to_grant_code(field_code_int),
        },
        'grant_stats_2025': grant_stats_info,
        'scores_breakdown': scores,
        'quotas': quotas,
        'universities': results,
        'ai_analysis': ai_analysis,
    }