from rest_framework import serializers
from .models import Game, GameProfile, Achievement, UserAchievement, GameStat

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'name', 'slug', 'icon', 'description']


class GameProfileSerializer(serializers.ModelSerializer):
    game_name = serializers.CharField(source='game.name', read_only=True)
    game_icon = serializers.CharField(source='game.icon', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = GameProfile
        fields = [
            'id', 'user', 'user_username', 'game', 'game_name', 'game_icon',
            'username', 'rank', 'level', 'experience',
            'preferred_role', 'preferred_agent', 'preferred_map', 'playstyle',
            'matches_played', 'wins', 'losses', 'kills', 'deaths', 'assists',
            'win_rate', 'kda', 'is_primary', 'created_at', 'updated_at'
        ]
        # ✅ Ajout de 'user' dans read_only_fields
        read_only_fields = ['user', 'win_rate', 'kda', 'matches_played', 'wins', 'losses', 'created_at', 'updated_at']


class AchievementSerializer(serializers.ModelSerializer):
    game_name = serializers.CharField(source='game.name', read_only=True)
    is_unlocked = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'game', 'game_name', 'icon', 'points', 'is_unlocked']

    def get_is_unlocked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserAchievement.objects.filter(
                user=request.user,
                achievement=obj
            ).exists()
        return False


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement_details = AchievementSerializer(source='achievement', read_only=True)
    game_name = serializers.CharField(source='game_profile.game.name', read_only=True)

    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'achievement_details', 'game_profile', 'game_name', 'unlocked_at', 'is_viewed']


class GameStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameStat
        fields = ['id', 'game_profile', 'stat_name', 'stat_value', 'updated_at']