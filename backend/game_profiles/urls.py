from django.urls import path
from .views import (
    GameListView, GameDetailView,
    GameProfileListView, GameProfileDetailView,
    GameStatListView, GameStatDetailView,
    AchievementListView, UserAchievementListView,
    set_primary_profile, unlock_achievement
)

urlpatterns = [
    # Jeux
    path('games/', GameListView.as_view(), name='game-list'),
    path('games/<int:pk>/', GameDetailView.as_view(), name='game-detail'),

    # Profils de jeu
    path('profiles/', GameProfileListView.as_view(), name='profile-list'),
    path('profiles/<int:pk>/', GameProfileDetailView.as_view(), name='profile-detail'),
    path('profiles/<int:pk>/primary/', set_primary_profile, name='set-primary-profile'),

    # Statistiques
    path('profiles/<int:profile_pk>/stats/', GameStatListView.as_view(), name='stat-list'),
    path('stats/<int:pk>/', GameStatDetailView.as_view(), name='stat-detail'),

    # Réalisations
    path('achievements/', AchievementListView.as_view(), name='achievement-list'),
    path('my-achievements/', UserAchievementListView.as_view(), name='my-achievements'),
    path('achievements/<int:achievement_id>/unlock/', unlock_achievement, name='unlock-achievement'),
]