from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

class UserRegistrationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'skill_level', 'favorite_games']

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
        return user