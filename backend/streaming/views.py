import requests
from datetime import timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings

from .models import StreamerProfile, StreamFollow, StreamNotification, StreamSchedule
from .serializers import (
    StreamerProfileSerializer, StreamFollowSerializer,
    StreamNotificationSerializer, StreamScheduleSerializer
)

# Configuration Twitch
TWITCH_CLIENT_ID = getattr(settings, 'TWITCH_CLIENT_ID', '')
TWITCH_CLIENT_SECRET = getattr(settings, 'TWITCH_CLIENT_SECRET', '')
_twitch_access_token = None
_twitch_token_expiry = None


def get_twitch_access_token():
    """Récupère un token d'accès Twitch"""
    global _twitch_access_token, _twitch_token_expiry

    if _twitch_access_token and _twitch_token_expiry and timezone.now() < _twitch_token_expiry:
        return _twitch_access_token

    if not TWITCH_CLIENT_ID or not TWITCH_CLIENT_SECRET:
        return None

    url = 'https://id.twitch.tv/oauth2/token'
    data = {
        'client_id': TWITCH_CLIENT_ID,
        'client_secret': TWITCH_CLIENT_SECRET,
        'grant_type': 'client_credentials'
    }
    try:
        response = requests.post(url, data=data)
        response.raise_for_status()
        result = response.json()
        _twitch_access_token = result['access_token']
        _twitch_token_expiry = timezone.now() + timedelta(seconds=result['expires_in'] - 60)
        return _twitch_access_token
    except Exception as e:
        print(f"Erreur Twitch token: {e}")
        return None


def check_twitch_stream(username):
    """Vérifie si un utilisateur est en live sur Twitch"""
    token = get_twitch_access_token()
    if not token:
        return {'is_online': False}

    url = f'https://api.twitch.tv/helix/streams?user_login={username}'
    headers = {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': f'Bearer {token}'
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        if data['data']:
            stream = data['data'][0]
            return {
                'is_online': True,
                'title': stream['title'],
                'game': stream['game_name'],
                'viewer_count': stream['viewer_count'],
                'thumbnail_url': stream['thumbnail_url'].replace('{width}', '320').replace('{height}', '180')
            }
        return {'is_online': False}
    except Exception as e:
        print(f"Erreur vérification Twitch: {e}")
        return {'is_online': False}


# =====================================================
# VUES POUR LE STREAMER CONNECTÉ
# =====================================================

class StreamerProfileView(generics.RetrieveUpdateAPIView):
    """Récupère et met à jour le profil du streamer connecté"""
    serializer_class = StreamerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = StreamerProfile.objects.get_or_create(user=self.request.user)
        return profile


# =====================================================
# VUES PUBLIQUES
# =====================================================

class PublicStreamerProfileView(generics.RetrieveAPIView):
    """Récupère un profil streamer par son username"""
    serializer_class = StreamerProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'user__username'
    lookup_url_kwarg = 'username'

    def get_queryset(self):
        return StreamerProfile.objects.all()


class StreamerDetailView(generics.RetrieveAPIView):
    """Récupère un streamer par son ID"""
    queryset = StreamerProfile.objects.all()
    serializer_class = StreamerProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


class StreamerListView(generics.ListAPIView):
    """Liste tous les streamers"""
    serializer_class = StreamerProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = StreamerProfile.objects.filter(twitch_username__isnull=False)
        game = self.request.query_params.get('game')
        if game and game != 'Tous':
            queryset = queryset.filter(stream_game__icontains=game)
        online_only = self.request.query_params.get('online_only')
        if online_only == 'true':
            queryset = queryset.filter(is_online=True)
        return queryset.order_by('-is_online', '-viewer_count')


# =====================================================
# CONNEXION TWITCH
# =====================================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def connect_twitch(request):
    """Connecte un compte Twitch au profil de l'utilisateur"""
    twitch_username = request.data.get('twitch_username')
    if not twitch_username:
        return Response(
            {'error': "Le nom d'utilisateur Twitch est requis."},
            status=status.HTTP_400_BAD_REQUEST
        )

    profile, created = StreamerProfile.objects.get_or_create(user=request.user)
    profile.twitch_username = twitch_username
    profile.save()

    # Vérifier si le streamer est en ligne
    stream_data = check_twitch_stream(twitch_username)
    if stream_data:
        was_online = profile.is_online
        profile.is_online = stream_data.get('is_online', False)
        profile.stream_title = stream_data.get('title', '')
        profile.stream_game = stream_data.get('game', '')
        profile.viewer_count = stream_data.get('viewer_count', 0)
        profile.thumbnail_url = stream_data.get('thumbnail_url', '')
        profile.last_checked = timezone.now()
        profile.save()

        # Notifier les followers si le streamer passe en ligne
        if not was_online and profile.is_online:
            for follow in profile.followers.all():
                StreamNotification.objects.create(
                    user=follow.follower,
                    streamer=profile,
                    message=f"🟢 {profile.user.username} est en live !"
                )

    serializer = StreamerProfileSerializer(profile, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def refresh_stream_status(request):
    """Rafraîchit le statut du streamer connecté"""
    try:
        profile = StreamerProfile.objects.get(user=request.user)
    except StreamerProfile.DoesNotExist:
        return Response(
            {'error': 'Aucun profil streamer trouvé.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if not profile.twitch_username:
        return Response(
            {'error': 'Aucun compte Twitch lié.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    stream_data = check_twitch_stream(profile.twitch_username)
    if stream_data:
        was_online = profile.is_online
        profile.is_online = stream_data.get('is_online', False)
        profile.stream_title = stream_data.get('title', '')
        profile.stream_game = stream_data.get('game', '')
        profile.viewer_count = stream_data.get('viewer_count', 0)
        profile.thumbnail_url = stream_data.get('thumbnail_url', '')
        profile.last_checked = timezone.now()
        profile.save()

        if not was_online and profile.is_online:
            for follow in profile.followers.all():
                StreamNotification.objects.create(
                    user=follow.follower,
                    streamer=profile,
                    message=f"🟢 {profile.user.username} est en live !"
                )

    serializer = StreamerProfileSerializer(profile, context={'request': request})
    return Response(serializer.data)


# =====================================================
# SUIVI DES STREAMERS
# =====================================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def follow_streamer(request, streamer_id):
    """Suivre un streamer"""
    streamer = get_object_or_404(StreamerProfile, id=streamer_id)

    if streamer.user == request.user:
        return Response(
            {'error': 'Vous ne pouvez pas vous suivre vous-même.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    follow, created = StreamFollow.objects.get_or_create(
        follower=request.user,
        streamer=streamer
    )

    if created:
        return Response({'message': f'Vous suivez {streamer.user.username}.'})
    return Response({'message': 'Vous suivez déjà ce streamer.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unfollow_streamer(request, streamer_id):
    """Ne plus suivre un streamer"""
    streamer = get_object_or_404(StreamerProfile, id=streamer_id)
    follow = StreamFollow.objects.filter(follower=request.user, streamer=streamer)

    if follow.exists():
        follow.delete()
        return Response({'message': f'Vous ne suivez plus {streamer.user.username}.'})
    return Response(
        {'error': 'Vous ne suivez pas ce streamer.'},
        status=status.HTTP_404_NOT_FOUND
    )


class FollowingListView(generics.ListAPIView):
    """Liste des streamers suivis par l'utilisateur"""
    serializer_class = StreamFollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StreamFollow.objects.filter(follower=self.request.user)


# =====================================================
# NOTIFICATIONS
# =====================================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stream_notifications(request):
    """Récupère les notifications de stream non lues"""
    notifications = StreamNotification.objects.filter(
        user=request.user,
        is_read=False
    ).order_by('-created_at')[:20]
    return Response(StreamNotificationSerializer(notifications, many=True).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, pk):
    """Marque une notification comme lue"""
    notification = get_object_or_404(StreamNotification, pk=pk, user=request.user)
    notification.is_read = True
    notification.save()
    return Response({'status': 'marked_read'})


# =====================================================
# PLANNING DES STREAMS
# =====================================================

class StreamScheduleListView(generics.ListCreateAPIView):
    """Liste et création des plannings de stream"""
    serializer_class = StreamScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'coach' or self.request.user.is_superuser:
            return StreamSchedule.objects.filter(streamer__user=self.request.user)
        return StreamSchedule.objects.filter(
            is_cancelled=False,
            scheduled_at__gte=timezone.now()
        )

    def perform_create(self, serializer):
        streamer, _ = StreamerProfile.objects.get_or_create(user=self.request.user)
        serializer.save(streamer=streamer)


class StreamScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un planning"""
    serializer_class = StreamScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StreamSchedule.objects.filter(streamer__user=self.request.user)