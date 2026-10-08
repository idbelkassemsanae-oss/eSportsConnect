from rest_framework import serializers
from .models import Resource, ResourceCategory, ResourceComment


class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = ['id', 'name', 'slug', 'icon']


class ResourceCommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = ResourceComment
        fields = ['id', 'user', 'user_username', 'user_avatar', 'content', 'created_at']
        read_only_fields = ['user', 'created_at']

    def get_user_avatar(self, obj):
        if obj.user and obj.user.avatar:
            return obj.user.avatar.url
        return None


class ResourceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    author_username = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    type_icon = serializers.CharField(source='get_type_icon', read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'description', 'content', 'resource_type', 'type_icon',
            'category', 'category_name', 'category_icon',
            'url', 'file', 'author', 'author_username', 'author_avatar',
            'views', 'likes', 'is_published', 'tags',
            'created_at', 'updated_at', 'comments_count'
        ]
        read_only_fields = ['views', 'likes', 'created_at', 'updated_at']

    def get_author_username(self, obj):
        if obj.author:
            return obj.author.username
        return None

    def get_author_avatar(self, obj):
        if obj.author and obj.author.avatar:
            return obj.author.avatar.url
        return None

    def get_comments_count(self, obj):
        return obj.comments.count()


class ResourceDetailSerializer(ResourceSerializer):
    comments = ResourceCommentSerializer(many=True, read_only=True)

    class Meta(ResourceSerializer.Meta):
        fields = ResourceSerializer.Meta.fields + ['comments']