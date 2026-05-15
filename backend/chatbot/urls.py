from django.urls import path
from .views import ChatView, ConversationListView, ConversationDetailView, ConversationMessageView

urlpatterns = [
    path('', ChatView.as_view(), name='chat'),
    path('conversations/', ConversationListView.as_view(), name='conversations'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:pk>/messages/', ConversationMessageView.as_view(), name='conversation-messages'),
]
