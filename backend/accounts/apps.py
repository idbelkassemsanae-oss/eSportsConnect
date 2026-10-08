# accounts/apps.py

from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    verbose_name = 'Gestion des comptes'
    
    def ready(self):
        """Importer les signaux si nécessaire"""
        # import accounts.signals
        pass