from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Affiche ces colonnes dans la liste de l'admin
    list_display = ('username', 'email', 'role', 'skill_level', 'favorite_games', 'is_active')
    
    # Ajoute des filtres pour faciliter la recherche
    list_filter = ('role', 'is_active', 'is_staff')

    # Ajoute nos champs personnalisés dans la page de détail de l'utilisateur
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'skill_level', 'favorite_games')}),
    )
    
    # Ajoute nos champs personnalisés lors de la création d'un nouvel utilisateur
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'skill_level', 'favorite_games')}),
    )