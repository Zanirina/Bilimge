import cloudinary.uploader
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class AvatarUploadView(APIView):
    """POST /api/auth/upload-avatar/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('avatar')
        if not file:
            return Response({'error': 'avatar required'}, status=400)

        result = cloudinary.uploader.upload(
            file,
            folder='avatars',
            public_id=f'user_{request.user.pk}',
            overwrite=True,
            resource_type='image',
            transformation=[
                {'width': 400, 'height': 400, 'crop': 'fill', 'gravity': 'face'}
            ]
        )

        request.user.avatar_url = result['secure_url']
        request.user.save()

        return Response({'avatar_url': result['secure_url']})