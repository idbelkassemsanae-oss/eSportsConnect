from django.db import models
from django.conf import settings

class StreamerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='streamer_profile'
    )
    twitch_username = models.CharField(max_length=100, blank=True, null=True)
    twitch_id = models.CharField(max_length=100, blank=True, null=True)
    is_online = models.BooleanField(default=False)
    stream_title = models.CharField(max_length=255, blank=True, null=True)
    stream_game = models.CharField(max_length=100, blank=True, null=True)
    viewer_count = models.IntegerField(default=0)
    thumbnail_url = models.URLField(blank=True, null=True)
    last_checked = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {'🟢 En ligne' if self.is_online else '🔴 Hors ligne'}"

    class Meta:
        ordering = ['-is_online', '-viewer_count']


class StreamFollow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following'
    )
    streamer = models.ForeignKey(
        'StreamerProfile',
        on_delete=models.CASCADE,
        related_name='followers'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['follower', 'streamer']

    def __str__(self):
        return f"{self.follower.username} suit {self.streamer.user.username}"


class StreamNotification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stream_notifications'
    )
    streamer = models.ForeignKey('StreamerProfile', on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.streamer.user.username} est en ligne!"


class StreamSchedule(models.Model):
    streamer = models.ForeignKey(
        'StreamerProfile',
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    game = models.CharField(max_length=100)
    scheduled_at = models.DateTimeField()
    duration = models.IntegerField(help_text="Durée en minutes", default=120)
    is_cancelled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.streamer.user.username} - {self.title}"

    class Meta:
        ordering = ['scheduled_at']
