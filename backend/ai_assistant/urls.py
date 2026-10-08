from django.urls import path
from .views import (
    chatbot_ask,
    chatbot_suggestions,
    personalized_recommendations,
    check_nouveautes,
    PlayerStatsView,
)

urlpatterns = [
    path('chatbot/', chatbot_ask, name='chatbot-ask'),
    path('chatbot/suggestions/', chatbot_suggestions, name='chatbot-suggestions'),
    path('recommendations/', personalized_recommendations, name='recommendations'),
    path('nouveautes/', check_nouveautes, name='nouveautes'),
    path('stats/', PlayerStatsView.as_view(), name='player-stats'),
]