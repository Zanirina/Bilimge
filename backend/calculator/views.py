from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from unipage.models import NtcProgram
from .services import calculate_chances, get_programs_for_subjects


class CalculatorView(APIView):
    """POST /api/calculator/chances/"""
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        # Валидация
        scores = data.get('scores', {})
        required_scores = ['history', 'math_literacy', 'reading_literacy', 'subject_1', 'subject_2']
        missing = [s for s in required_scores if s not in scores]
        if missing:
            return Response({'error': f'Не хватает баллов: {", ".join(missing)}'}, status=400)

        if not data.get('ntc_program_code') and not (data.get('subject_1_id') and data.get('subject_2_id')):
            return Response({'error': 'Укажите ntc_program_code или оба предмета (subject_1_id, subject_2_id)'}, status=400)

        result = calculate_chances(data)
        return Response(result)


class ProgramsBySubjectsView(APIView):
    """GET /api/calculator/programs/?subject_1=1&subject_2=3"""
    permission_classes = [AllowAny]

    def get(self, request):
        s1 = request.query_params.get('subject_1')
        s2 = request.query_params.get('subject_2')

        if not s1 or not s2:
            return Response({'error': 'subject_1 и subject_2 обязательны'}, status=400)

        programs = get_programs_for_subjects(int(s1), int(s2))
        data = [{'code': p.code, 'name': p.name, 'field': p.field_of_study.name} for p in programs]
        return Response(data)