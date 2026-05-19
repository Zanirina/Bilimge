from django.shortcuts import render, get_object_or_404, redirect
from rest_framework.views import APIView
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from announcements.models import Announcement
from announcements.views import notify_users
from .models import Accreditation
from rest_framework import serializers
from .serializers import AccreditationSerializer
from userpage.permissions import IsNtcAdmin, IsUniAdminOfThisUniversity, IsUniAdmin
from .models import University, UniversityProgram, NtcProgram, FieldOfStudy, Subject, Language
from .serializers import (
    UniversitySerializer,
    UniversityPageSerializer,
    FieldOfStudySerializer,
    NtcProgramSerializer,
    NtcProgramUpdateSerializer,
    SubjectSerializer,
    UniversityProgramSerializer,
    UniversityProgramWriteSerializer,
    UniversityBasicUpdateSerializer
)


class MyUniversityView(APIView):
    permission_classes = [IsUniAdmin]

    def get(self, request):
        try:
            university = request.user.staff_profile.university
            serializer = UniversitySerializer(university)
            return Response(serializer.data)
        except Exception:
            return Response({"error": "Employee profile not found"}, status=404)


class MyUniversityProgramView(APIView):
    permission_classes = [IsUniAdmin]

    def get(self, request):
        university = request.user.staff_profile.university
        programs = UniversityProgram.objects.filter(
            university=university
        ).select_related('ntc_program', 'language')
        serializer = UniversityProgramSerializer(programs, many=True)
        return Response(serializer.data)

    def post(self, request):
        university = request.user.staff_profile.university
        serializer = UniversityProgramWriteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(university=university)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class MyUniversityProgramDetailView(APIView):
    permission_classes = [IsUniAdmin]

    def get_program(self, request, code):
        university = request.user.staff_profile.university
        try:
            return UniversityProgram.objects.get(code=code, university=university)
        except UniversityProgram.DoesNotExist:
            return None

    def patch(self, request, code):
        program = self.get_program(request, code)
        if not program:
            return Response({"error": "Not found"}, status=404)
        serializer = UniversityProgramWriteSerializer(program, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            ann = Announcement.objects.create(
                title=f'Обновление программы {program.local_name}',
                body=f'Университет {program.university.name} обновил информацию по программе «{program.local_name}».',
                author_type='university',
                university_id=program.university.code,
                university_name=program.university.name,
                created_by=request.user,
            )
            notify_users(ann)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, code):
        program = self.get_program(request, code)
        if not program:
            return Response({"error": "Not found"}, status=404)
        program.delete()
        return Response({"status": "deleted"}, status=204)


# --- ViewSets ---

class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsUniAdminOfThisUniversity()]

    def get_serializer_class(self):
        # Полная страница вуза (программы по полям, экзамены, аккредитации,
        # требования) нужна именно для retrieve — фронт ходит за ней по
        # /unipage/api/universities/<code>/.
        if self.action == 'retrieve':
            return UniversityPageSerializer
        return UniversitySerializer


class FieldOfStudyViewSet(viewsets.ModelViewSet):
    queryset = FieldOfStudy.objects.all()
    serializer_class = FieldOfStudySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsNtcAdmin()]


class UniversityProgramViewSet(viewsets.ModelViewSet):
    serializer_class = UniversityProgramSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsUniAdminOfThisUniversity()]

    def get_queryset(self):
        queryset = UniversityProgram.objects.select_related(
            'university', 'ntc_program', 'language'
        )
        university = self.request.query_params.get('university')
        if university:
            queryset = queryset.filter(university=university)
        return queryset


class NtcProgramViewSet(viewsets.ModelViewSet):
    queryset = NtcProgram.objects.select_related('field_of_study', 'subject_1', 'subject_2').all()
    serializer_class = NtcProgramSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsNtcAdmin()]

    def get_serializer_class(self):
        if self.action in ['partial_update', 'update']:
            return NtcProgramUpdateSerializer
        return NtcProgramSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsNtcAdmin()]


# --- Template views ---

def unipage(request):
    universities = University.objects.all()
    return render(request, 'main/unipage.html', {'uni_list': universities})


def field_list(request):
    fields = FieldOfStudy.objects.all()
    return render(request, 'main/field_list.html', {'fields': fields})


def ntc_programs_by_field(request, field_code):
    field = get_object_or_404(FieldOfStudy, code=field_code)
    programs = NtcProgram.objects.filter(field_of_study=field)
    return render(request, 'main/ntc_programs.html', {
        'field': field,
        'programs': programs
    })


def ntc_program_edit(request, code=None, field_code=None):
    program = get_object_or_404(NtcProgram, code=code) if code else None
    current_field = get_object_or_404(FieldOfStudy, code=field_code) if field_code else None

    if request.method == "POST":
        name = request.POST.get('name')
        f_id = request.POST.get('field_of_study')
        s1_id = request.POST.get('subject_1')
        s2_id = request.POST.get('subject_2')
        new_code = request.POST.get('code')

        if program:
            program.name = name
            program.subject_1_id = s1_id
            program.subject_2_id = s2_id
            program.save()
            target_field = program.field_of_study_id
        else:
            NtcProgram.objects.create(
                code=new_code, name=name,
                field_of_study_id=f_id,
                subject_1_id=s1_id, subject_2_id=s2_id
            )
            target_field = f_id
        return redirect('programs_by_field', field_code=target_field)

    return render(request, 'main/ntc_form.html', {
        'program': program,
        'current_field': current_field or (program.field_of_study if program else None),
        'fields': FieldOfStudy.objects.all(),
        'subjects': Subject.objects.all()
    })


def ntc_program_delete(request, code):
    program = get_object_or_404(NtcProgram, code=code)
    field_code = program.field_of_study_id
    program.delete()
    return redirect('programs_by_field', field_code=field_code)


def field_edit(request, code=None):
    field = get_object_or_404(FieldOfStudy, code=code) if code else None

    if request.method == "POST":
        new_code = request.POST.get('code')
        name = request.POST.get('name')

        if field:
            field.name = name
            field.save()
        else:
            FieldOfStudy.objects.create(code=new_code, name=name)
        return redirect('field_list')

    return render(request, 'main/field_form.html', {'field': field})


def field_delete(request, code):
    field = get_object_or_404(FieldOfStudy, code=code)
    try:
        field.delete()
    except Exception:
        pass
    return redirect('field_list')

from .models import (
    University, UniversityProgram, NtcProgram, FieldOfStudy, Subject,
    EntranceRequirement, EntranceExam, AcademicMobility, UniversityLanguage
)
from .serializers import (
    UniversitySerializer, UniversityUpdateSerializer,
    UniversityPageSerializer,
    UniversityProgramDetailSerializer,
    FieldOfStudySerializer, NtcProgramSerializer, SubjectSerializer,
    UniversityProgramSerializer, UniversityProgramWriteSerializer,
    EntranceRequirementWriteSerializer, EntranceExamWriteSerializer,
    AcademicMobilityWriteSerializer,
)


# --- Публичные страницы ---

class UniversityPageView(APIView):
    """GET /unipage/api/universities/<code>/"""
    permission_classes = [AllowAny]

    def get(self, request, code):
        university = get_object_or_404(University, code=code)
        serializer = UniversityPageSerializer(university)
        return Response(serializer.data)


class UniversityProgramPageView(APIView):
    """GET /unipage/api/university-programs/<code>/"""
    permission_classes = [AllowAny]

    def get(self, request, code):
        program = get_object_or_404(
            UniversityProgram.objects.select_related(
                'university', 'ntc_program__field_of_study',
                'ntc_program__subject_1', 'ntc_program__subject_2',
                'language'
            ),
            code=code
        )
        serializer = UniversityProgramDetailSerializer(program)
        return Response(serializer.data)


# --- Uni Admin: редактирование университета ---

class MyUniversityUpdateView(APIView):
    """PATCH /unipage/api/my-university/info/ — редактирование основной инфы"""
    permission_classes = [IsUniAdmin]

    def patch(self, request):
        university = request.user.staff_profile.university
        serializer = UniversityUpdateSerializer(university, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class MyUniversityLanguagesView(APIView):
    """
    GET  /unipage/api/my-university/languages/  — список языков обучения
    POST /unipage/api/my-university/languages/  — добавить язык ({"language_id": 2})
    """
    permission_classes = [IsUniAdmin]

    def get(self, request):
        university = request.user.staff_profile.university
        langs = UniversityLanguage.objects.filter(university=university).select_related('language')
        return Response([{'id': ul.language.id, 'name': ul.language.name} for ul in langs])

    def post(self, request):
        university = request.user.staff_profile.university
        lang_id = request.data.get('language_id')
        if not lang_id:
            return Response({'error': 'language_id required'}, status=400)
        obj, created = UniversityLanguage.objects.get_or_create(
            university=university, language_id=lang_id
        )
        return Response({'id': obj.language.id, 'name': obj.language.name}, status=201 if created else 200)


class MyUniversityLanguageDeleteView(APIView):
    """DELETE /unipage/api/my-university/languages/<lang_id>/"""
    permission_classes = [IsUniAdmin]

    def delete(self, request, lang_id):
        university = request.user.staff_profile.university
        deleted, _ = UniversityLanguage.objects.filter(
            university=university, language_id=lang_id
        ).delete()
        if deleted:
            return Response({'status': 'deleted'}, status=204)
        return Response({'error': 'Not found'}, status=404)


class MyUniversityRequirementsView(APIView):
    """
    GET  /unipage/api/my-university/requirements/
    POST /unipage/api/my-university/requirements/
    """
    permission_classes = [IsUniAdmin]

    def get(self, request):
        university = request.user.staff_profile.university
        qs = EntranceRequirement.objects.filter(university=university)
        return Response(EntranceRequirementWriteSerializer(qs, many=True).data)

    def post(self, request):
        university = request.user.staff_profile.university
        serializer = EntranceRequirementWriteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(university=university)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class MyUniversityRequirementDetailView(APIView):
    """
    PATCH  /unipage/api/my-university/requirements/<pk>/
    DELETE /unipage/api/my-university/requirements/<pk>/
    """
    permission_classes = [IsUniAdmin]

    def get_object(self, request, pk):
        university = request.user.staff_profile.university
        return get_object_or_404(EntranceRequirement, pk=pk, university=university)

    def patch(self, request, pk):
        obj = self.get_object(request, pk)
        serializer = EntranceRequirementWriteSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        self.get_object(request, pk).delete()
        return Response({'status': 'deleted'}, status=204)


class MyUniversityExamsView(APIView):
    """
    GET  /unipage/api/my-university/exams/
    POST /unipage/api/my-university/exams/
    """
    permission_classes = [IsUniAdmin]

    def get(self, request):
        university = request.user.staff_profile.university
        qs = EntranceExam.objects.filter(university=university)
        return Response(EntranceExamWriteSerializer(qs, many=True).data)

    def post(self, request):
        university = request.user.staff_profile.university
        serializer = EntranceExamWriteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(university=university)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class MyUniversityExamDetailView(APIView):
    """
    PATCH  /unipage/api/my-university/exams/<pk>/
    DELETE /unipage/api/my-university/exams/<pk>/
    """
    permission_classes = [IsUniAdmin]

    def get_object(self, request, pk):
        university = request.user.staff_profile.university
        return get_object_or_404(EntranceExam, pk=pk, university=university)

    def patch(self, request, pk):
        obj = self.get_object(request, pk)
        serializer = EntranceExamWriteSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        self.get_object(request, pk).delete()
        return Response({'status': 'deleted'}, status=204)


class MyUniversityMobilityView(APIView):
    """
    GET  /unipage/api/my-university/mobility/
    POST /unipage/api/my-university/mobility/
    """
    permission_classes = [IsUniAdmin]

    def get(self, request):
        university = request.user.staff_profile.university
        qs = AcademicMobility.objects.filter(university=university)
        return Response(AcademicMobilityWriteSerializer(qs, many=True).data)

    def post(self, request):
        university = request.user.staff_profile.university
        serializer = AcademicMobilityWriteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(university=university)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class MyUniversityMobilityDetailView(APIView):
    """
    PATCH  /unipage/api/my-university/mobility/<pk>/
    DELETE /unipage/api/my-university/mobility/<pk>/
    """
    permission_classes = [IsUniAdmin]

    def get_object(self, request, pk):
        university = request.user.staff_profile.university
        return get_object_or_404(AcademicMobility, pk=pk, university=university)

    def patch(self, request, pk):
        obj = self.get_object(request, pk)
        serializer = AcademicMobilityWriteSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        self.get_object(request, pk).delete()
        return Response({'status': 'deleted'}, status=204)

class NtcUniversityUpdateView(APIView):
    """PATCH /unipage/api/universities/<code>/edit/ — только для NTC"""
    permission_classes = [IsNtcAdmin]

    def patch(self, request, code):
            university = get_object_or_404(University, code=code)
            serializer = UniversityBasicUpdateSerializer(university, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)


class LanguageListView(APIView):
    """GET /unipage/api/languages/ — all available languages"""
    permission_classes = [AllowAny]

    def get(self, request):
        from .serializers import LanguageSerializer
        languages = Language.objects.all().order_by('name')
        return Response(LanguageSerializer(languages, many=True).data)


class MyUniversityApplicantsView(APIView):
    """GET /unipage/api/my-university/applicants/ — applicants who favourited this university"""
    permission_classes = [IsUniAdmin]

    def get(self, request):
        from userpage.models import Favorite
        university = request.user.staff_profile.university

        # Fetch program codes as strings — avoids the varchar=integer JOIN error
        # (favorites.program_id is varchar, university_programs.code is integer in DB)
        program_codes_int = list(
            UniversityProgram.objects.filter(university=university).values_list('code', flat=True)
        )
        if not program_codes_int:
            return Response([])

        program_name_by_code = {
            str(code): name
            for code, name in UniversityProgram.objects
            .filter(university=university)
            .values_list('code', 'local_name')
        }

        favorites = (
            Favorite.objects
            .filter(program_id__in=[str(c) for c in program_codes_int])
            .select_related('user', 'user__applicant_profile')
            .order_by('-created_at')
        )

        applicants = {}
        for fav in favorites:
            user = fav.user
            if user.id not in applicants:
                profile = getattr(user, 'applicant_profile', None)
                applicants[user.id] = {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "unt_score": profile.unt_score if profile else None,
                    "favorited_programs": [],
                    "first_favorited_at": fav.created_at.isoformat(),
                }
            applicants[user.id]["favorited_programs"].append({
                "code": fav.program_id,
                "local_name": program_name_by_code.get(str(fav.program_id), fav.program_id),
                "favorited_at": fav.created_at.isoformat(),
            })

        return Response(list(applicants.values()))


class AccreditationWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accreditation
        fields = ['id', 'name', 'issued_by', 'valid_until']


class MyUniversityAccreditationsView(APIView):
    """GET/POST /unipage/api/my-university/accreditations/"""
    permission_classes = [IsUniAdmin]

    def get(self, request):
        university = request.user.staff_profile.university
        qs = Accreditation.objects.filter(university=university)
        return Response(AccreditationWriteSerializer(qs, many=True).data)

    def post(self, request):
        university = request.user.staff_profile.university
        serializer = AccreditationWriteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(university=university)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class MyUniversityAccreditationDetailView(APIView):
    """PATCH/DELETE /unipage/api/my-university/accreditations/<pk>/"""
    permission_classes = [IsUniAdmin]

    def get_object(self, request, pk):
        university = request.user.staff_profile.university
        return get_object_or_404(Accreditation, pk=pk, university=university)

    def patch(self, request, pk):
        obj = self.get_object(request, pk)
        serializer = AccreditationWriteSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        self.get_object(request, pk).delete()
        return Response({'status': 'deleted'}, status=204)