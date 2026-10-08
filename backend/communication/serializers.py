from rest_framework import serializers
from .models import Conversation, Message
from accounts.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.SerializerMethodField()
    is_sender = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_username', 'sender_avatar',
            'content', 'is_read', 'is_toxic', 'timestamp', 'is_sender'
        ]
        read_only_fields = [
            'is_read', 'is_toxic', 'timestamp', 'sender_username', 'sender_avatar', 'is_sender'
        ]

    def get_sender_avatar(self, obj):
        if obj.sender.avatar:
            return obj.sender.avatar.url
        return None

    def get_is_sender(self, obj):
        request = self.context.get('request')
        return request and obj.sender == request.user


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    participants_ids = serializers.ListField(
        write_only=True,
        required=False,
        child=serializers.IntegerField()
    )
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'title', 'is_group', 'participants', 'participants_ids',
            'last_message', 'unread_count', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'participants': {'required': False}
        }

    def get_last_message(self, obj):
        last = obj.get_last_message()
        if last:
            return MessageSerializer(last, context=self.context).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return Message.objects.filter(
            conversation=obj,
            is_read=False
        ).exclude(sender=request.user).count()