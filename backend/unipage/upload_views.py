import cloudinary.uploader
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from userpage.permissions import IsUniAdmin, IsNtcAdmin
from .models import University
from announcements.models import Announcement


class UniversityPhotoUploadView(APIView):
    """POST /unipage/api/my-university/upload-photo/"""
    permission_classes = [IsUniAdmin]

    def post(self, request):
        file = request.FILES.get('photo')
        if not file:
            return Response({'error': 'photo required'}, status=400)

        university = request.user.staff_profile.university

        result = cloudinary.uploader.upload(
            file,
            folder='universities',
            public_id=f'uni_{university.code}',
            overwrite=True,
            resource_type='image'
        )

        university.photo_url = result['secure_url']
        university.save()

        return Response({'photo_url': result['secure_url']})


class AnnouncementImageUploadView(APIView):
    """POST /api/announcements/{id}/upload-image/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        file = request.FILES.get('image')
        if not file:
            return Response({'error': 'image required'}, status=400)

        try:
            ann = Announcement.objects.get(pk=pk, created_by=request.user)
        except Announcement.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        result = cloudinary.uploader.upload(
            file,
            folder='announcements',
            public_id=f'ann_{pk}',
            overwrite=True,
            resource_type='image'
        )

        ann.image_url = result['secure_url']
        ann.save()

        return Response({'image_url': result['secure_url']})