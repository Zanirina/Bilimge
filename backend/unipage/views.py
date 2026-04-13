from django.shortcuts import render
from rest_framework import viewsets
from .models import University
from .serializers import (
    UniversitySerializer,
    FieldOfStudySerializer,
    NtcProgramSerializer,
    SubjectSerializer
)

from .models import NtcProgram, FieldOfStudy, Subject
from django.shortcuts import render, get_object_or_404, redirect



class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer

class FieldOfStudyViewSet(viewsets.ModelViewSet):
    queryset = FieldOfStudy.objects.all()
    serializer_class = FieldOfStudySerializer

class NtcProgramViewSet(viewsets.ModelViewSet):
    queryset = NtcProgram.objects.all()
    serializer_class = NtcProgramSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer




def unipage(request):
    universities = University.objects.all()
    total_found= universities.count()

    context = {
        'universities': universities,
        'total_found': total_found}


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


# Создание или редактирование направления
def field_edit(request, code=None):
    field = get_object_or_404(FieldOfStudy, code=code) if code else None

    if request.method == "POST":
        new_code = request.POST.get('code')
        name = request.POST.get('name')

        if field:  # Редактирование
            field.name = name
            field.save()
        else:  # Создание
            FieldOfStudy.objects.create(code=new_code, name=name)
        return redirect('field_list')

    return render(request, 'main/field_form.html', {'field': field})


def field_delete(request, code):
    field = get_object_or_404(FieldOfStudy, code=code)
    try:
        field.delete()
    except Exception as e:
        pass
    return redirect('field_list')