from django.urls import path
from .views import (
    TournamentListCreateView,
    TournamentDetailView,
    register_tournament,
    get_notifications,
    mark_notification_read,
    my_tournaments,
    manage_teams,
    manage_matches,
    submit_score,
    get_leaderboard,
    get_global_leaderboard,   
)

urlpatterns = [
    path('', TournamentListCreateView.as_view(), name='tournament-list'),
    path('<int:pk>/', TournamentDetailView.as_view(), name='tournament-detail'),
    
    # Inscription et notifications
    path('<int:pk>/register/', register_tournament, name='tournament-register'),
    path('notifications/', get_notifications, name='notifications'),
    path('notifications/<int:pk>/read/', mark_notification_read, name='notification-read'),
    
    # Mes tournois
    path('my-tournaments/', my_tournaments, name='my-tournaments'),
    
    # Gestion des équipes et matchs
    path('<int:pk>/teams/', manage_teams, name='manage-teams'),
    path('<int:pk>/matches/', manage_matches, name='manage-matches'),
    path('<int:pk>/matches/<int:match_pk>/score/', submit_score, name='submit-score'),
    
    # Classements
    path('<int:pk>/leaderboard/', get_leaderboard, name='tournament-leaderboard'),
    path('global-leaderboard/', get_global_leaderboard, name='global-leaderboard'),  # ✅ Nouvelle route
]