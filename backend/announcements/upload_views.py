import cloudinary.uploader
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Announcement


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