from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import ChatMessage
from .services import get_ai_response


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """История переписки"""
        messages = ChatMessage.objects.filter(user=request.user)
        return Response([
            {"role": msg.role, "content": msg.content, "created_at": msg.created_at}
            for msg in messages
        ])

    def post(self, request):
        """Отправить сообщение"""
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response({"error": "Сообщение не может быть пустым"}, status=400)

        # сохраняем сообщение пользователя
        ChatMessage.objects.create(
            user=request.user,
            role='user',
            content=user_message
        )

        # берём последние 10 сообщений для контекста
        history = list(ChatMessage.objects.filter(
            user=request.user
        ).order_by('-created_at')[:10].values('role', 'content'))
        history.reverse()

        # получаем ответ ИИ
        try:
            ai_response = get_ai_response(user_message, history)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        # сохраняем ответ ИИ
        ChatMessage.objects.create(
            user=request.user,
            role='assistant',
            content=ai_response
        )

        return Response({"response": ai_response})

    def delete(self, request):
        """Очистить историю"""
        ChatMessage.objects.filter(user=request.user).delete()
        return Response({"status": "история очищена"})