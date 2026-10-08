from rest_framework import serializers
from .models import StreamerProfile, StreamFollow, StreamNotification, StreamSchedule
from accounts.serializers import UserSerializer


class StreamerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.SerializerMethodField()
    is_followed = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    youtube_video_id = serializers.SerializerMethodField()  # ✅ NOUVEAU

    class Meta:
        model = StreamerProfile
        fields = [
            'id', 'user', 'username', 'avatar', 'twitch_username', 'twitch_id',
            'is_online', 'stream_title', 'stream_game', 'viewer_count',
            'thumbnail_url', 'youtube_video_id', 'last_checked',
            'is_followed', 'followers_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'is_online', 'stream_title', 'stream_game', 'viewer_count',
            'thumbnail_url', 'last_checked', 'created_at', 'updated_at'
        ]

    def get_avatar(self, obj):
        """Retourne l'URL de l'avatar ou None s'il n'existe pas"""
        if obj.user and obj.user.avatar:
            return obj.user.avatar.url
        return None

    def get_is_followed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return StreamFollow.objects.filter(
                follower=request.user,
                streamer=obj
            ).exists()
        return False

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_youtube_video_id(self, obj):
        """
        Extrait l'ID YouTube depuis thumbnail_url.
        Ex: https://www.youtube.com/watch?v=6ztrJA_efXs → 6ztrJA_efXs
        """
        url = obj.thumbnail_url or ''
        if 'youtube.com/watch?v=' in url:
            return url.split('v=')[1].split('&')[0]
        elif 'youtu.be/' in url:
            return url.split('youtu.be/')[1].split('?')[0]
        elif 'youtube.com/embed/' in url:
            return url.split('embed/')[1].split('?')[0]
        return None


class StreamFollowSerializer(serializers.ModelSerializer):
    streamer_username = serializers.CharField(source='streamer.user.username', read_only=True)
    streamer_avatar = serializers.SerializerMethodField()
    is_online = serializers.BooleanField(source='streamer.is_online', read_only=True)
    stream_title = serializers.CharField(source='streamer.stream_title', read_only=True)
    stream_game = serializers.CharField(source='streamer.stream_game', read_only=True)

    class Meta:
        model = StreamFollow
        fields = [
            'id', 'streamer', 'streamer_username', 'streamer_avatar',
            'is_online', 'stream_title', 'stream_game', 'created_at'
        ]

    def get_streamer_avatar(self, obj):
        if obj.streamer and obj.streamer.user and obj.streamer.user.avatar:
            return obj.streamer.user.avatar.url
        return None


class StreamNotificationSerializer(serializers.ModelSerializer):
    streamer_username = serializers.CharField(source='streamer.user.username', read_only=True)

    class Meta:
        model = StreamNotification
        fields = ['id', 'streamer', 'streamer_username', 'message', 'is_read', 'created_at']


class StreamScheduleSerializer(serializers.ModelSerializer):
    streamer_username = serializers.CharField(source='streamer.user.username', read_only=True)

    class Meta:
        model = StreamSchedule
        fields = [
            'id', 'streamer', 'streamer_username', 'title', 'description',
            'game', 'scheduled_at', 'duration', 'is_cancelled', 'created_at'
        ]