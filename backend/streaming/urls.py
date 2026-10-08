from django.urls import path
from .views import (
    StreamerProfileView, PublicStreamerProfileView, StreamerDetailView, StreamerListView,
    connect_twitch, refresh_stream_status,
    follow_streamer, unfollow_streamer, FollowingListView,
    stream_notifications, mark_notification_read,
    StreamScheduleListView, StreamScheduleDetailView
)

urlpatterns = [
    # Profil du streamer connecté
    path('profile/', StreamerProfileView.as_view(), name='streamer-profile'),
    
    # Profil public par username
    path('profile/<str:username>/', PublicStreamerProfileView.as_view(), name='public-streamer-profile'),
    
    # Liste de tous les streamers
    path('list/', StreamerListView.as_view(), name='streamer-list'),
    
    # ✅ NOUVEAU : Détail d'un streamer par ID
    path('list/<int:id>/', StreamerDetailView.as_view(), name='streamer-detail'),
    
    # Connexion Twitch
    path('connect/', connect_twitch, name='connect-twitch'),
    path('refresh/', refresh_stream_status, name='refresh-stream'),
    
    # Suivi
    path('follow/<int:streamer_id>/', follow_streamer, name='follow-streamer'),
    path('unfollow/<int:streamer_id>/', unfollow_streamer, name='unfollow-streamer'),
    path('following/', FollowingListView.as_view(), name='following-list'),
    
    # Notifications
    path('notifications/', stream_notifications, name='stream-notifications'),
    path('notifications/<int:pk>/read/', mark_notification_read, name='mark-notification-read'),
    
    # Plannings
    path('schedules/', StreamScheduleListView.as_view(), name='schedule-list'),
    path('schedules/<int:pk>/', StreamScheduleDetailView.as_view(), name='schedule-detail'),
]