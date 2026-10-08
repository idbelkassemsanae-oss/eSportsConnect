from django.contrib import admin
from .models import StreamerProfile, StreamFollow, StreamNotification, StreamSchedule

@admin.register(StreamerProfile)
class StreamerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'twitch_username', 'is_online', 'stream_game', 'viewer_count', 'last_checked')
    list_filter = ('is_online',)
    search_fields = ('user__username', 'twitch_username', 'stream_game')
    readonly_fields = ('last_checked', 'created_at', 'updated_at')

@admin.register(StreamFollow)
class StreamFollowAdmin(admin.ModelAdmin):
    list_display = ('id', 'follower', 'streamer', 'created_at')
    search_fields = ('follower__username', 'streamer__user__username')

@admin.register(StreamNotification)
class StreamNotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'streamer', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')

@admin.register(StreamSchedule)
class StreamScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'streamer', 'title', 'game', 'scheduled_at', 'is_cancelled')
    list_filter = ('is_cancelled', 'scheduled_at')
