from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Applicant, Favorite
from .serializers import RegisterSerializer, UserMeSerializer, ApplicantProfileSerializer, FavoriteSerializer
from .models import User, Applicant
from .serializers import RegisterSerializer, UserMeSerializer, ApplicantProfileSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserMeSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserMeSerializer(request.user).data)

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