from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static
from . import views

# ✅ Import de la vue chatbot depuis ai_assistant
from ai_assistant.views import chatbot_ask

urlpatterns = [
    # Page d'accueil (API JSON)
    path('', views.home, name='home'),

    # Interface d'administration Django
    path('admin/', admin.site.urls),

    # Documentation Swagger
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Authentification JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API des Applications
    path('api/accounts/', include('accounts.urls')),
    path('api/tournaments/', include('tournaments.urls')),
    path('api/', include('coaching.urls')),   # coaching
    path('api/communication/', include('communication.urls')),
    path('api/resources/', include('resources.urls')),
    path('api/ai/', include('ai_assistant.urls')),  # ✅ /api/ai/chatbot/ (existant)
    path('api/game-profiles/', include('game_profiles.urls')),
    path('api/streaming/', include('streaming.urls')),

    # ✅ NOUVELLE ROUTE : chatbot accessible directement via /api/chatbot/
    path('api/chatbot/', chatbot_ask, name='chatbot-ask-main'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)