from django.contrib import admin
from .models import Game, GameProfile, Achievement, UserAchievement, GameStat

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'icon', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(GameProfile)
class GameProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'game', 'username', 'rank', 'is_primary', 'matches_played', 'win_rate')
    list_filter = ('game', 'is_primary')
    search_fields = ('user__username', 'username')
    readonly_fields = ('win_rate', 'kda', 'created_at', 'updated_at')

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'game', 'points', 'condition_type', 'condition_value')
    list_filter = ('game',)
    search_fields = ('name',)

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'achievement', 'game_profile', 'unlocked_at', 'is_viewed')
    list_filter = ('achievement', 'is_viewed')
    search_fields = ('user__username',)

@admin.register(GameStat)
class GameStatAdmin(admin.ModelAdmin):
    list_display = ('id', 'game_profile', 'stat_name', 'stat_value', 'updated_at')
    list_filter = ('stat_name',)
    search_fields = ('game_profile__user__username',)