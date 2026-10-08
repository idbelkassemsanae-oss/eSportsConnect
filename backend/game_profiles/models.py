from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Game(models.Model):
    """Jeu disponible sur la plateforme"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class GameProfile(models.Model):
    """Profil de jeu d'un utilisateur pour un jeu spécifique"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='game_profiles'
    )
    game = models.ForeignKey(
        Game, 
        on_delete=models.CASCADE, 
        related_name='profiles'
    )
    
    # Informations générales
    username = models.CharField(max_length=100, blank=True, null=True)
    rank = models.CharField(max_length=50, blank=True, null=True)
    level = models.IntegerField(default=1)
    experience = models.IntegerField(default=0)
    
    # Préférences
    preferred_role = models.CharField(max_length=50, blank=True, null=True)
    preferred_agent = models.CharField(max_length=50, blank=True, null=True)
    preferred_map = models.CharField(max_length=50, blank=True, null=True)
    playstyle = models.CharField(max_length=100, blank=True, null=True)
    
    # Statistiques
    matches_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    kills = models.IntegerField(default=0)
    deaths = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    win_rate = models.FloatField(default=0.0)
    kda = models.FloatField(default=0.0)
    
    # Métadonnées
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'game']

    def __str__(self):
        return f"{self.user.username} - {self.game.name}"


class Achievement(models.Model):
    """Réalisation/défi que les joueurs peuvent débloquer"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='achievements')
    icon = models.CharField(max_length=50, blank=True, null=True)
    points = models.IntegerField(default=10)
    condition_type = models.CharField(max_length=50)
    condition_value = models.IntegerField()

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    """Réalisations débloquées par un utilisateur"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='achievements'
    )
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    game_profile = models.ForeignKey(
        GameProfile, 
        on_delete=models.CASCADE, 
        related_name='user_achievements'
    )
    unlocked_at = models.DateTimeField(auto_now_add=True)
    is_viewed = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'achievement']

    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"


class GameStat(models.Model):
    """Statistiques détaillées d'un joueur pour un jeu"""
    game_profile = models.ForeignKey(
        GameProfile, 
        on_delete=models.CASCADE, 
        related_name='stats'
    )
    stat_name = models.CharField(max_length=50)
    stat_value = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['game_profile', 'stat_name']

    def __str__(self):
        return f"{self.game_profile.user.username} - {self.stat_name}: {self.stat_value}"