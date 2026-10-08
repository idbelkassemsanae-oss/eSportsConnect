from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Game, GameProfile, Achievement, UserAchievement, GameStat
from .serializers import (
    GameSerializer, GameProfileSerializer, 
    AchievementSerializer, UserAchievementSerializer,
    GameStatSerializer
)


# ============================================================
# JEUX
# ============================================================

class GameListView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]


class GameDetailView(generics.RetrieveAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]


# ============================================================
# PROFILS DE JEU
# ============================================================

class GameProfileListView(generics.ListCreateAPIView):
    serializer_class = GameProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GameProfile.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        game_id = request.data.get('game')
        if GameProfile.objects.filter(user=request.user, game_id=game_id).exists():
            return Response(
                {"error": "Un profil pour ce jeu existe déjà."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GameProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GameProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GameProfile.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_primary_profile(request, pk):
    profile = get_object_or_404(GameProfile, pk=pk, user=request.user)
    GameProfile.objects.filter(user=request.user).update(is_primary=False)
    profile.is_primary = True
    profile.save()
    return Response({'message': 'Profil principal défini.'})


# ============================================================
# STATISTIQUES
# ============================================================

class GameStatListView(generics.ListCreateAPIView):
    serializer_class = GameStatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile_id = self.kwargs.get('profile_pk')
        return GameStat.objects.filter(game_profile_id=profile_id, game_profile__user=self.request.user)

    def perform_create(self, serializer):
        profile_id = self.kwargs.get('profile_pk')
        profile = get_object_or_404(GameProfile, pk=profile_id, user=self.request.user)
        serializer.save(game_profile=profile)


class GameStatDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GameStatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GameStat.objects.filter(game_profile__user=self.request.user)


# ============================================================
# RÉALISATIONS
# ============================================================

class AchievementListView(generics.ListAPIView):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        game_id = self.request.query_params.get('game')
        if game_id:
            return Achievement.objects.filter(game_id=game_id)
        return Achievement.objects.all()


class UserAchievementListView(generics.ListAPIView):
    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user).order_by('-unlocked_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unlock_achievement(request, achievement_id):
    achievement = get_object_or_404(Achievement, id=achievement_id)
    
    if UserAchievement.objects.filter(user=request.user, achievement=achievement).exists():
        return Response({'message': 'Déjà débloqué.'}, status=status.HTTP_400_BAD_REQUEST)
    
    game_profile = GameProfile.objects.filter(user=request.user, game=achievement.game).first()
    if not game_profile:
        return Response({'error': 'Vous devez avoir un profil pour ce jeu.'}, status=status.HTTP_400_BAD_REQUEST)
    
    user_achievement = UserAchievement.objects.create(
        user=request.user,
        achievement=achievement,
        game_profile=game_profile
    )
    
    return Response({
        'message': '✅ Réalisation débloquée !',
        'achievement': AchievementSerializer(achievement).data
    }, status=status.HTTP_201_CREATED)