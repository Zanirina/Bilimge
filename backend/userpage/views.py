from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Applicant, Favorite, UniversityStaff
from .serializers import (
    RegisterSerializer, UserMeSerializer,
    ApplicantProfileSerializer, FavoriteSerializer,
    UserUpdateSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # select_related for applicant_profile only — joining through
        # target_speciality causes varchar/integer type mismatch in PostgreSQL
        # (applicant.target_speciality_id is varchar, ntc_programs.code is int).
        # The lazy load of target_speciality works via simple WHERE, so we skip
        # the deep join here.
        user = User.objects.select_related(
            'applicant_profile', 'staff_profile',
        ).prefetch_related('favorites').get(pk=request.user.pk)

        serializer = UserMeSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user = User.objects.select_related(
                'applicant_profile', 'staff_profile',
            ).prefetch_related('favorites').get(pk=request.user.pk)
            return Response(UserMeSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/ — verify current pw, set new."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current = request.data.get('current_password')
        new = request.data.get('new_password')
        if not current or not new:
            return Response(
                {'error': 'current_password and new_password are required'},
                status=400,
            )
        if len(new) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters.'},
                status=400,
            )
        if not request.user.check_password(current):
            return Response({'error': 'Current password is incorrect.'}, status=400)
        request.user.set_password(new)
        request.user.save()
        return Response({'message': 'Password changed successfully.'})

class ApplicantProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_applicant:
            return Response({"error": "Only for Applicant"}, status=403)
        profile, created = Applicant.objects.get_or_create(user=request.user)
        return Response(ApplicantProfileSerializer(profile).data)

    def patch(self, request):
        if not request.user.is_applicant:
            return Response({"error": "Only for Applicant"}, status=403)
        profile, created = Applicant.objects.get_or_create(user=request.user)
        serializer = ApplicantProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)



class FavoriteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Все избранные программы"""
        favorites = Favorite.objects.filter(user=request.user).select_related(
            'program', 'program__university'
        )
        # группируем по университетам
        grouped = {}
        for fav in favorites:
            uni_name = fav.program.university.name
            if uni_name not in grouped:
                grouped[uni_name] = {
                    "university_code": fav.program.university.code,
                    "university_name": uni_name,
                    "programs": []
                }
            grouped[uni_name]["programs"].append({
                "id": fav.id,
                "program_code": fav.program.code,
                "program_name": fav.program.local_name,
            })
        return Response(list(grouped.values()))

    def post(self, request):
        """Добавить в избранное"""
        serializer = FavoriteSerializer(data=request.data)
        if serializer.is_valid():
            # проверяем что такого избранного ещё нет
            program = serializer.validated_data['program']
            if Favorite.objects.filter(user=request.user, program=program).exists():
                return Response({"error": "Уже в избранном"}, status=400)
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class FavoriteDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        """Удалить из избранного"""
        try:
            fav = Favorite.objects.get(pk=pk, user=request.user)
            fav.delete()
            return Response({"status": "удалено"}, status=204)
        except Favorite.DoesNotExist:
            return Response({"error": "Не найдено"}, status=404)