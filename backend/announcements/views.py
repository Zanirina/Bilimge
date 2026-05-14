from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mass_mail
from django.contrib.auth import get_user_model
from .models import Announcement
from .serializers import AnnouncementSerializer, AnnouncementWriteSerializer
from userpage.permissions import IsNtcAdmin, IsUniAdmin

User = get_user_model()


def notify_users(announcement):
    """Отправить письмо всем юзерам у кого есть email"""
    emails = list(User.objects.filter(email__isnull=False).exclude(email='').values_list('email', flat=True))
    if not emails:
        return

    link = f"https://bilimge.kz/announcements/{announcement.pk}/"
    messages = tuple(
        (
            f'Новое объявление: {announcement.title}',
            f'{announcement.body[:200]}...\n\nПодробнее: {link}',
            None,
            [email]
        )
        for email in emails
    )
    send_mass_mail(messages, fail_silently=True)


class AnnouncementListView(APIView):
    """GET /api/announcements/ — публичный список"""
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Announcement.objects.select_related('created_by').all()
        # Фильтр по типу: ?author_type=ntc или ?author_type=university
        author_type = request.query_params.get('author_type')
        if author_type:
            qs = qs.filter(author_type=author_type)
        serializer = AnnouncementSerializer(qs, many=True)
        return Response(serializer.data)


class AnnouncementDetailView(APIView):
    """GET /api/announcements/<pk>/"""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        from django.shortcuts import get_object_or_404
        ann = get_object_or_404(Announcement, pk=pk)
        return Response(AnnouncementSerializer(ann).data)


class NtcAnnouncementView(APIView):
    """POST /api/announcements/ntc/ — NTC публикует объявление"""
    permission_classes = [IsNtcAdmin]

    def post(self, request):
        serializer = AnnouncementWriteSerializer(data=request.data)
        if serializer.is_valid():
            ann = serializer.save(
                author_type='ntc',
                created_by=request.user
            )
            notify_users(ann)
            return Response(AnnouncementSerializer(ann).data, status=201)
        return Response(serializer.errors, status=400)


class UniAnnouncementView(APIView):
    permission_classes = [IsUniAdmin]

    def post(self, request):
        university = request.user.staff_profile.university
        serializer = AnnouncementWriteSerializer(data=request.data)
        if serializer.is_valid():
            ann = serializer.save(
                author_type='university',
                university_id=university.code,
                university_name=university.name,
                created_by=request.user,
            )
            notify_users(ann)
            return Response(AnnouncementSerializer(ann).data, status=201)
        return Response(serializer.errors, status=400)


class UniAnnouncementDeleteView(APIView):
    """DELETE /api/announcements/<pk>/delete/ — uni admin deletes own announcement"""
    permission_classes = [IsUniAdmin]

    def delete(self, request, pk):
        from django.shortcuts import get_object_or_404
        university = request.user.staff_profile.university
        ann = get_object_or_404(Announcement, pk=pk, author_type='university',
                                university_id=university.code)
        ann.delete()
        return Response(status=204)
