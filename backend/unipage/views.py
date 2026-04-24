from django.shortcuts import render, get_object_or_404, redirect
from rest_framework.views import APIView
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from userpage.permissions import IsNtcAdmin, IsUniAdminOfThisUniversity, IsUniAdmin
from .models import University, UniversityProgram, NtcProgram, FieldOfStudy, Subject
from .serializers import (
    UniversitySerializer,
    FieldOfStudySerializer,
    NtcProgramSerializer,
    SubjectSerializer,
    UniversityProgramSerializer,
    UniversityProgramWriteSerializer,
)


# --- My University (Uni Admin) ---

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
    queryset = NtcProgram.objects.all()
    serializer_class = NtcProgramSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsNtcAdmin()]


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