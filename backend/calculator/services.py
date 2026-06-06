from groq import Groq
from django.conf import settings
from unipage.models import NtcProgram, UniversityProgram
from announcements.models import GrantWinner
from django.db.models import Min, Max, Avg, Count

_client = None

def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


MIN_SCORE_BY_TYPE = {
    'law':         75,
    'pedagogy':    75,
    'medicine':    70,
    'agriculture': 50,
    'national':    65,
    'default':     50,
}

FIELD_TYPE_MAP = {
    1: 'pedagogy', 2: 'pedagogy', 3: 'pedagogy', 4: 'pedagogy',
    5: 'pedagogy', 6: 'pedagogy', 7: 'pedagogy', 9: 'pedagogy',
    10: 'pedagogy', 11: 'pedagogy', 12: 'pedagogy', 13: 'pedagogy',
    14: 'pedagogy', 15: 'pedagogy', 16: 'pedagogy', 17: 'pedagogy',
    60: 'medicine', 61: 'medicine', 62: 'medicine', 91: 'medicine',
    80: 'agriculture', 81: 'agriculture', 82: 'agriculture',
    84: 'agriculture', 85: 'agriculture', 87: 'agriculture',
    42: 'law', 43: 'law',
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

LANGUAGE_INSTRUCTIONS = {
    'en': "Respond in English.",
    'ru': "Отвечай на русском языке.",
    'kk': "Қазақ тілінде жауап бер.",
}


def field_code_to_grant_code(field_code) -> str:
    code_str = str(field_code)
    digits = ''.join(filter(str.isdigit, code_str))
    if len(digits) >= 3:
        return f"B{digits[-3:]}"
    return f"B{digits.zfill(3)}"


def get_field_type(field_code) -> str:
    try:
        digits = ''.join(filter(str.isdigit, str(field_code)))
        num = int(digits[-3:]) if len(digits) >= 3 else 0
        return FIELD_TYPE_MAP.get(num, 'default')
    except (ValueError, TypeError):
        return 'default'
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


def get_grant_stats_from_winners(field_code_int, university_code=None) -> dict:
    grant_code = field_code_to_grant_code(field_code_int)
    qs = GrantWinner.objects.filter(field_code=grant_code, year=2025)
    if university_code is not None:
        qs = qs.filter(university_code=str(university_code))
    stats = qs.aggregate(
        min_score=Min('score'),
        max_score=Max('score'),
        avg_score=Avg('score'),
        total=Count('id'),
    )
    return stats


def calculate_grant_chance(total_score: int, grant_score: int, quotas: list) -> float:
    if grant_score is None or grant_score == 0:
        return 0.0

    diff = total_score - grant_score

    if diff >= 20:
        base_chance = 97.0
    elif diff >= 10:
        base_chance = 92.0
    elif diff >= 5:
        base_chance = 85.0
    elif diff >= 0:
        base_chance = 72.0
    elif diff >= -5:
        base_chance = 45.0
    elif diff >= -10:
        base_chance = 22.0
    elif diff >= -20:
        base_chance = 8.0
    else:
        base_chance = 2.0

    quota_bonus = sum(QUOTA_BONUS.get(q, 0) for q in quotas) * 100
    return round(min(98.0, base_chance + quota_bonus), 1)


def calculate_grant_chance_by_winners(
    total_score: int,
    field_code_int,
    quotas: list,
    university_code=None,
) -> tuple[float, str]:
    grant_code = field_code_to_grant_code(field_code_int)
    source = 'grant_winners_2025'

    qs = GrantWinner.objects.filter(field_code=grant_code, year=2025)
    if university_code is not None:
        per_uni = qs.filter(university_code=str(university_code))
        if per_uni.exists():
            qs = per_uni
            source = 'grant_winners_2025_university'

    total = qs.count()
    if total == 0:
        return 0.0, source

    below = qs.filter(score__lt=total_score).count()
    at_or_below = qs.filter(score__lte=total_score).count()
    percentile = ((below + at_or_below) / 2) / total * 100

    pct = percentile / 100.0
    base_chance = 10.0 + 88.0 * (1 - (1 - pct) ** 2)

    quota_bonus = sum(QUOTA_BONUS.get(q, 0) for q in quotas) * 100
    return round(min(98.0, base_chance + quota_bonus), 1), source


def get_programs_for_subjects(subject_1_id: int, subject_2_id: int):
    return (
        NtcProgram.objects.filter(
            subject_1_id=subject_1_id, subject_2_id=subject_2_id
        ).select_related('field_of_study') |
        NtcProgram.objects.filter(
            subject_1_id=subject_2_id, subject_2_id=subject_1_id
        ).select_related('field_of_study')
    )


def get_ai_analysis(
    total_score: int,
    results: list,
    quotas: list,
    ntc_program_name: str,
    language: str = 'ru',
) -> str:
    try:
        client = get_client()
        lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS['ru'])

        top_unis = results[:5]
        unis_text = "\n".join([
            f"- {r['university_name']} ({r['university_city']}): "
            f"шанс на грант {r['grant_chance']}%, "
            f"грант-балл {r['grant_score'] or 'нет данных'}"
            for r in top_unis
        ])

        prompt = f"""Абитуриент набрал {total_score} баллов ЕНТ по специальности "{ntc_program_name}".
Квоты: {', '.join(quotas) if quotas else 'нет'}.

Топ университетов по шансу на грант:
{unis_text}

Напиши краткий анализ (3-4 предложения) обращаясь к абитуриенту на "Вы".
Например: "С вашим баллом...", "У вас есть шанс...", "Вам рекомендуется..."
{lang_instruction} Будь конкретным и позитивным но честным.
Если данные взяты из статистики грантников (grant_winners_2025) — это реальные данные прошлого года."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": f"Ты эксперт по поступлению в казахстанские университеты. Обращайся на Вы. {lang_instruction}"
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000,
        )
        return response.choices[0].message.content
    except Exception:
        return ""


def calculate_chances(data: dict) -> dict:
    subject_1_id = data.get('subject_1_id')
    subject_2_id = data.get('subject_2_id')
    scores = data.get('scores', {})
    quotas = data.get('quotas', [])
    ntc_program_code = data.get('ntc_program_code')
    language = data.get('language', 'ru')

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
            grant_chance, data_source = calculate_grant_chance_by_winners(
                total_score, field_code_int, quotas, university_code=up.university.code,
            )

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

    ai_analysis = get_ai_analysis(total_score, results, quotas, ntc_program.name, language)

    grant_stats_info = None
    if grant_stats['total']:
        grant_code = field_code_to_grant_code(field_code_int)
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
            'grant_code': field_code_to_grant_code(field_code_int),
        },
        'grant_stats_2025': grant_stats_info,
        'scores_breakdown': scores,
        'quotas': quotas,
        'universities': results,
        'ai_analysis': ai_analysis,
    }