from django.contrib import admin
from .models import Resource, ResourceCategory, ResourceComment

@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon')
    search_fields = ('name',)

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'resource_type', 'category', 'author', 'views', 'likes', 'is_published', 'created_at')
    list_filter = ('resource_type', 'category', 'is_published')
    search_fields = ('title', 'description', 'tags')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('views', 'likes', 'created_at', 'updated_at')

@admin.register(ResourceComment)
class ResourceCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'resource', 'user', 'content_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content',)

    def content_preview(self, obj):
        return obj.content[:50] + '…' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Commentaire'