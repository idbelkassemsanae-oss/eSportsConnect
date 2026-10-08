from django.urls import path
from . import views

urlpatterns = [
    # Inscription
    path('register/player/', views.register_player, name='register_player'),
    path('register/coach/', views.register_coach, name='register_coach'),

    # Profil
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),

    # Diplômes (coach)
    path('diplomas/upload/', views.upload_diploma, name='upload_diploma'),
    path('diplomas/delete/<int:pk>/', views.delete_diploma, name='delete_diploma'),

    # Liste des utilisateurs (admin)
    path('users/', views.list_users, name='list_users'),
]