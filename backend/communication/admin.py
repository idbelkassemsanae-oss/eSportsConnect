from django.contrib import admin
from .models import Conversation, Message, MessageReadStatus, ModerationLog

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'is_group', 'created_at', 'updated_at')
    filter_horizontal = ('participants',)
    search_fields = ('title',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'conversation', 'content_preview', 'is_read', 'is_toxic', 'timestamp')
    list_filter = ('is_read', 'is_toxic')
    search_fields = ('sender__username', 'content')
    readonly_fields = ('timestamp',)

    def content_preview(self, obj):
        return obj.content[:50] + '…' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Contenu'

@admin.register(MessageReadStatus)
class MessageReadStatusAdmin(admin.ModelAdmin):
    list_display = ('id', 'message', 'user', 'read_at')

@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'toxic_score', 'action_taken', 'created_at')
    list_filter = ('action_taken',)
    search_fields = ('user__username', 'content')