from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Applicant, Favorite, FavoriteUniversity, UniversityStaff
from unipage.models import UniversityProgram, University
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
        favorites = list(Favorite.objects.filter(user=request.user).only('id', 'program_id'))
        if not favorites:
            return Response([])

        program_keys = {str(f.program_id) for f in favorites}
        programs = UniversityProgram.objects.filter(
            code__in=list(program_keys)
        ).select_related('university')
        program_map = {str(p.code): p for p in programs}

        grouped = {}
        for fav in favorites:
            program = program_map.get(str(fav.program_id))
            if program is None:
                continue
            university = program.university
            if university is None:
                continue
            uni_name = university.name
            if uni_name not in grouped:
                grouped[uni_name] = {
                    "university_code": university.code,
                    "university_name": uni_name,
                    "programs": [],
                }
            grouped[uni_name]["programs"].append({
                "id": fav.id,
                "program_code": program.code,
                "program_name": program.local_name,
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
        try:
            fav = Favorite.objects.get(pk=pk, user=request.user)
            fav.delete()
            return Response({"status": "удалено"}, status=204)
        except Favorite.DoesNotExist:
            return Response({"error": "Не найдено"}, status=404)


class FavoriteUniversityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rows = list(
            FavoriteUniversity.objects.filter(user=request.user).only('id', 'university_id', 'created_at')
        )
        if not rows:
            return Response([])

        codes = {str(r.university_id) for r in rows}
        universities = University.objects.filter(code__in=list(codes))
        uni_map = {str(u.code): u for u in universities}

        result = []
        for row in rows:
            uni = uni_map.get(str(row.university_id))
            if uni is None:
                continue
            result.append({
                "id": row.id,
                "university_code": uni.code,
                "university_name": uni.name,
                "short_name": uni.short_name,
                "city": uni.city,
                "logo_url": uni.logo_url,
                "cover_url": uni.cover_url,
            })
        return Response(result)

    def post(self, request):
        code = request.data.get('university')
        if not code:
            return Response({"error": "university обязателен"}, status=400)

        try:
            university = University.objects.get(code=code)
        except University.DoesNotExist:
            return Response({"error": "Вуз не найден"}, status=404)

        exists = FavoriteUniversity.objects.filter(
            user=request.user,
            university_id=str(university.code)
        ).exists()

        if exists:
            fav = FavoriteUniversity.objects.get(
                user=request.user,
                university_id=str(university.code)
            )
            return Response({
                "id": fav.id,
                "university_code": university.code,
                "university_name": university.name,
            }, status=200)

        fav = FavoriteUniversity.objects.create(
            user=request.user,
            university_id=str(university.code),
        )
        return Response({
            "id": fav.id,
            "university_code": university.code,
            "university_name": university.name,
        }, status=201)

class FavoriteUniversityDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            fav = FavoriteUniversity.objects.get(pk=pk, user=request.user)
            fav.delete()
            return Response({"status": "удалено"}, status=204)
        except FavoriteUniversity.DoesNotExist:
            return Response({"error": "Не найдено"}, status=404)