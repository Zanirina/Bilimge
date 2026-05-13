import uuid
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.cache import cache

User = get_user_model()


class PasswordResetRequestView(APIView):
    """POST /api/auth/reset-password/ — отправить письмо с кодом"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'email required'}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Не говорим что юзера нет — безопаснее
            return Response({'message': 'If this email exists, a reset link was sent.'})

        token = str(uuid.uuid4())
        # Сохраняем токен в кэше на 30 минут
        cache.set(f'reset:{token}', user.pk, timeout=60 * 30)

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/auth/reset-password?token={token}"

        try:
            send_mail(
                subject='Сброс пароля — Bilimge',
                message=f'Для сброса пароля перейдите по ссылке:\n{reset_link}\n\nСсылка действительна 30 минут.',
                from_email=None,
                recipient_list=[email],
            )
        except Exception:
            if settings.DEBUG:
                return Response({'message': 'If this email exists, a reset link was sent.', 'debug_link': reset_link})
            return Response({'error': 'Failed to send email. Please try again later.'}, status=500)

        return Response({'message': 'If this email exists, a reset link was sent.'})


class PasswordResetConfirmView(APIView):
    """POST /api/auth/reset-password/confirm/ — применить новый пароль"""
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not token or not new_password:
            return Response({'error': 'token and password required'}, status=400)

        user_pk = cache.get(f'reset:{token}')
        if not user_pk:
            return Response({'error': 'Invalid or expired token'}, status=400)

        try:
            user = User.objects.get(pk=user_pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        user.set_password(new_password)
        user.save()
        cache.delete(f'reset:{token}')

        return Response({'message': 'Password successfully reset'})