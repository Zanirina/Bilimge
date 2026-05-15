import traceback
import cloudinary.uploader
from rest_framework.views import APIView
from rest_framework.response import Response
from userpage.permissions import IsUniAdmin


class UniversityLogoUploadView(APIView):
    """POST /unipage/api/my-university/upload-logo/"""
    permission_classes = [IsUniAdmin]

    def post(self, request):
        file = request.FILES.get('logo')
        if not file:
            return Response({'error': 'logo required'}, status=400)
        try:
            university = request.user.staff_profile.university
            result = cloudinary.uploader.upload(
                file,
                folder='universities/logos',
                public_id=f'logo_{university.code}',
                overwrite=True,
                resource_type='image',
            )
            university.logo_url = result['secure_url']
            university.save(update_fields=['logo_url'])
            return Response({'logo_url': result['secure_url']})
        except Exception as e:
            return Response({'error': str(e), 'trace': traceback.format_exc()}, status=500)


class UniversityCoverUploadView(APIView):
    """POST /unipage/api/my-university/upload-cover/"""
    permission_classes = [IsUniAdmin]

    def post(self, request):
        file = request.FILES.get('cover')
        if not file:
            return Response({'error': 'cover required'}, status=400)
        try:
            university = request.user.staff_profile.university
            result = cloudinary.uploader.upload(
                file,
                folder='universities/covers',
                public_id=f'cover_{university.code}',
                overwrite=True,
                resource_type='image',
            )
            university.cover_url = result['secure_url']
            university.save(update_fields=['cover_url'])
            return Response({'cover_url': result['secure_url']})
        except Exception as e:
            return Response({'error': str(e), 'trace': traceback.format_exc()}, status=500)