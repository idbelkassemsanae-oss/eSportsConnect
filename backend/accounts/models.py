from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('player', 'Joueur'),
        ('coach', 'Coach'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='player')
    skill_level = models.CharField(max_length=50, blank=True, null=True)
    favorite_games = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    main_game = models.CharField(max_length=100, blank=True, null=True)
    platform = models.CharField(max_length=50, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    experience_years = models.IntegerField(blank=True, null=True)
    objectives = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.username