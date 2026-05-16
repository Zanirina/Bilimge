from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import CalendarEvent
from .serializers import CalendarEventSerializer, CalendarEventWriteSerializer, CalendarEventUpdateSerializer
from userpage.permissions import IsNtcAdmin, IsUniAdmin
from unipage.models import UniversityProgram


def _favorite_university_ids_for(user):
    """Собирает id вузов, в которые подписан пользователь (через избранные программы
    и через избранные вузы напрямую). Не используем select_related: favorites.program_id
    в унаследованной схеме — integer, а university_programs.code — varchar, поэтому ORM-JOIN
    падает. Резолвим программы вручную через приведение ключей к строкам.
    """
    from userpage.models import FavoriteUniversity  # импорт здесь, чтобы избежать циклов

    program_ids = list(
        user.favorites.values_list('program_id', flat=True).distinct()
    )
    uni_ids = set()
    if program_ids:
        program_keys = {str(pid) for pid in program_ids}
        for p in UniversityProgram.objects.filter(code__in=list(program_keys)).only('university_id'):
            uni_ids.add(p.university_id)

    direct = FavoriteUniversity.objects.filter(user=user).values_list('university_id', flat=True)
    uni_ids.update(direct)
    return list(uni_ids)


class CalendarEventListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = CalendarEvent.objects.filter(visibility='public')

        if request.user.is_authenticated:
            favorite_uni_ids = _favorite_university_ids_for(request.user)
            qs = CalendarEvent.objects.filter(
                Q(visibility='public') |
                Q(visibility='university', university_id__in=favorite_uni_ids) |
                Q(visibility='personal', created_by=request.user)
            )

        month = request.query_params.get('month')
        year = request.query_params.get('year')
        university = request.query_params.get('university')
        event_type = request.query_params.get('type')

        if month:
            qs = qs.filter(start_date__month=month)
        if year:
            qs = qs.filter(start_date__year=year)
        if university:
            qs = qs.filter(university_id=university)
        if event_type:
            qs = qs.filter(event_type=event_type)

        qs = qs.select_related('created_by').order_by('start_date', 'start_time')
        return Response(CalendarEventSerializer(qs, many=True).data)


class UniversityCalendarView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, code):
        qs = CalendarEvent.objects.filter(
            university_id=code,
            visibility__in=['public', 'university']
        ).select_related('created_by')

        month = request.query_params.get('month')
        year = request.query_params.get('year')
        if month:
            qs = qs.filter(start_date__month=month)
        if year:
            qs = qs.filter(start_date__year=year)

        return Response(CalendarEventSerializer(qs, many=True).data)


class NtcCalendarView(APIView):
    permission_classes = [IsNtcAdmin]

    def post(self, request):
        serializer = CalendarEventWriteSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.save(
                visibility='public',
                created_by=request.user,
                university_id=None,
            )
            return Response(CalendarEventSerializer(event).data, status=201)
        return Response(serializer.errors, status=400)


class NtcCalendarDetailView(APIView):
    permission_classes = [IsNtcAdmin]

    def get_object(self, pk):
        # university_id__isnull вместо university__isnull
        return get_object_or_404(CalendarEvent, pk=pk, university_id__isnull=True)

    def patch(self, request, pk):
        event = self.get_object(pk)
        serializer = CalendarEventUpdateSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(CalendarEventSerializer(event).data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        self.get_object(pk).delete()
        return Response({'status': 'deleted'}, status=204)


class UniCalendarView(APIView):
    permission_classes = [IsUniAdmin]

    def get(self, request):
        university = request.user.staff_profile.university
        qs = CalendarEvent.objects.filter(
            university_id=university.code
        ).order_by('start_date', 'start_time')

        month = request.query_params.get('month')
        year = request.query_params.get('year')
        if month:
            qs = qs.filter(start_date__month=month)
        if year:
            qs = qs.filter(start_date__year=year)

        return Response(CalendarEventSerializer(qs, many=True).data)

    def post(self, request):
        university = request.user.staff_profile.university
        serializer = CalendarEventWriteSerializer(data=request.data)
        if serializer.is_valid():
            visibility = request.data.get('visibility', 'university')
            if visibility not in ['public', 'university']:
                visibility = 'university'
            event = serializer.save(
                university_id=university.code,
                visibility=visibility,
                created_by=request.user
            )
            return Response(CalendarEventSerializer(event).data, status=201)
        return Response(serializer.errors, status=400)


class UniCalendarDetailView(APIView):
    permission_classes = [IsUniAdmin]

    def get_object(self, request, pk):
        university = request.user.staff_profile.university
        # university_id вместо university=
        return get_object_or_404(CalendarEvent, pk=pk, university_id=university.code)

    def patch(self, request, pk):
        event = self.get_object(request, pk)
        serializer = CalendarEventUpdateSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(CalendarEventSerializer(event).data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        self.get_object(request, pk).delete()
        return Response({'status': 'deleted'}, status=204)


class PersonalCalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = CalendarEvent.objects.filter(
            visibility='personal',
            created_by=request.user
        ).order_by('start_date', 'start_time')
        return Response(CalendarEventSerializer(qs, many=True).data)

    def post(self, request):
        serializer = CalendarEventWriteSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.save(
                visibility='personal',
                created_by=request.user,
                university_id=None,
            )
            return Response(CalendarEventSerializer(event).data, status=201)
        return Response(serializer.errors, status=400)


class PersonalCalendarDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return get_object_or_404(
            CalendarEvent, pk=pk,
            visibility='personal',
            created_by=request.user
        )

    def patch(self, request, pk):
        event = self.get_object(request, pk)
        serializer = CalendarEventUpdateSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(CalendarEventSerializer(event).data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        self.get_object(request, pk).delete()
        return Response({'status': 'deleted'}, status=204)