from django.urls import path
from .views import (
    ConversationListView,
    ConversationCreateView,
    ConversationDetailView,
    MessageListView,
    mark_message_read,
    unread_messages,
    unread_messages_count,
    search_users,
)

urlpatterns = [
    # Conversations
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/create/', ConversationCreateView.as_view(), name='conversation-create'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),

    # Messages
    path('conversations/<int:conversation_pk>/messages/', MessageListView.as_view(), name='message-list'),
    path('messages/<int:pk>/read/', mark_message_read, name='message-mark-read'),

    # Utilitaires
    path('unread-messages/', unread_messages, name='unread-messages'),
    path('unread-count/', unread_messages_count, name='unread-count'),
    path('search-users/', search_users, name='search-users'),
]