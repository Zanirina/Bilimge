from django.shortcuts import render
from rest_framework import viewsets
from .models import University
from .serializers import UniversitySerializer


class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer


def unipage(request):
    universities = University.objects.all()
    total_found= universities.count()

    context = {
        'universities': universities,
        'total_found': total_found}


    return render(request, 'main/unipage.html', {'uni_list': universities})