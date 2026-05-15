from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatMessage, Conversation
from .services import get_ai_response


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        convs = Conversation.objects.filter(user=request.user)
        return Response([
            {"id": c.id, "title": c.title, "created_at": c.created_at, "updated_at": c.updated_at}
            for c in convs
        ])

    def post(self, request):
        title = request.data.get('title', 'New Chat')
        conv = Conversation.objects.create(user=request.user, title=title[:200])
        return Response({"id": conv.id, "title": conv.title, "created_at": conv.created_at}, status=201)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            conv = Conversation.objects.get(pk=pk, user=request.user)
        except Conversation.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
        messages = ChatMessage.objects.filter(conversation=conv)
        return Response({
            "id": conv.id,
            "title": conv.title,
            "messages": [
                {"role": m.role, "content": m.content, "created_at": m.created_at}
                for m in messages
            ],
        })

    def patch(self, request, pk):
        try:
            conv = Conversation.objects.get(pk=pk, user=request.user)
        except Conversation.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
        conv.title = request.data.get('title', conv.title)[:200]
        conv.save()
        return Response({"id": conv.id, "title": conv.title})

    def delete(self, request, pk):
        try:
            conv = Conversation.objects.get(pk=pk, user=request.user)
        except Conversation.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
        conv.delete()
        return Response({"status": "deleted"})


class ConversationMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            conv = Conversation.objects.get(pk=pk, user=request.user)
        except Conversation.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response({"error": "Message cannot be empty"}, status=400)

        ChatMessage.objects.create(
            user=request.user, conversation=conv, role='user', content=user_message
        )

        # Auto-title on first message
        msg_count = ChatMessage.objects.filter(conversation=conv).count()
        if conv.title == 'New Chat' and msg_count == 1:
            conv.title = user_message[:60]
            conv.save()

        history = list(
            ChatMessage.objects.filter(conversation=conv)
            .order_by('-created_at')[:10]
            .values('role', 'content')
        )
        history.reverse()

        try:
            ai_response = get_ai_response(user_message, history)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        ChatMessage.objects.create(
            user=request.user, conversation=conv, role='assistant', content=ai_response
        )
        conv.save()  # bump updated_at

        return Response({"response": ai_response, "conversation_title": conv.title})


class ChatView(APIView):
    """Legacy endpoint — kept for backward compatibility."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messages = ChatMessage.objects.filter(user=request.user, conversation__isnull=True)
        return Response([
            {"role": m.role, "content": m.content, "created_at": m.created_at}
            for m in messages
        ])

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response({"error": "Message cannot be empty"}, status=400)

        ChatMessage.objects.create(user=request.user, role='user', content=user_message)

        history = list(
            ChatMessage.objects.filter(user=request.user, conversation__isnull=True)
            .order_by('-created_at')[:10]
            .values('role', 'content')
        )
        history.reverse()

        try:
            ai_response = get_ai_response(user_message, history)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        ChatMessage.objects.create(user=request.user, role='assistant', content=ai_response)
        return Response({"response": ai_response})

    def delete(self, request):
        ChatMessage.objects.filter(user=request.user).delete()
        return Response({"status": "cleared"})
