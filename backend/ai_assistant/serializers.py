from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class PlayerStatsSerializer(serializers.ModelSerializer):
    # ✅ Correction : plus de 'source' pour username (c'est le même nom)
    username = serializers.CharField(read_only=True)
    total_matches = serializers.SerializerMethodField()
    wins = serializers.SerializerMethodField()
    losses = serializers.SerializerMethodField()
    win_rate = serializers.SerializerMethodField()
    points = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    forces = serializers.SerializerMethodField()
    faiblesses = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'total_matches', 'wins', 'losses',
            'win_rate', 'points', 'stats', 'forces', 'faiblesses'
        ]

    def get_total_matches(self, obj):
        from tournaments.models import Match
        
        total = 0
        # Matchs où le joueur est player1 ou player2
        total += Match.objects.filter(player1=obj).count()
        total += Match.objects.filter(player2=obj).count()
        
        # Matchs où le joueur est membre d'une équipe (team1 ou team2)
        try:
            total += Match.objects.filter(team1__members=obj).count()
            total += Match.objects.filter(team2__members=obj).count()
        except Exception:
            pass
            
        return total

    def get_wins(self, obj):
        from tournaments.models import Match
        
        wins = 0
        # Victoires en solo (winner_player)
        wins += Match.objects.filter(winner_player=obj).count()
        
        # Victoires en équipe (winner_team contient le joueur)
        try:
            wins += Match.objects.filter(winner_team__members=obj).count()
        except Exception:
            pass
            
        return wins

    def get_losses(self, obj):
        total = self.get_total_matches(obj)
        wins = self.get_wins(obj)
        return total - wins

    def get_win_rate(self, obj):
        total = self.get_total_matches(obj)
        wins = self.get_wins(obj)
        return round((wins / total) * 100, 1) if total > 0 else 0.0

    def get_points(self, obj):
        from tournaments.models import LeaderboardEntry
        
        points = 0
        # Points en solo (player)
        points += LeaderboardEntry.objects.filter(player=obj).aggregate(
            total=models.Sum('points')
        )['total'] or 0
        
        # Points en équipe (team contient le joueur)
        try:
            points += LeaderboardEntry.objects.filter(team__members=obj).aggregate(
                total=models.Sum('points')
            )['total'] or 0
        except Exception:
            pass
            
        return points

    def get_stats(self, obj):
        total = self.get_total_matches(obj)
        wins = self.get_wins(obj)
        win_rate = self.get_win_rate(obj)
        points = self.get_points(obj)

        # Calcul des compétences avec des formules adaptées
        try:
            stats = {
                'agilite': min(100, int(win_rate * 0.7 + 20)),
                'endurance': min(100, int(total * 2 + 30)),
                'precision': min(100, int(win_rate * 0.8 + 15)),
                'strategie': min(100, int(points * 0.5 + 30)),
                'travail_equipe': min(100, int(wins * 5 + 30))
            }
        except Exception:
            stats = {
                'agilite': 50,
                'endurance': 50,
                'precision': 50,
                'strategie': 50,
                'travail_equipe': 50
            }
        return stats

    def get_forces(self, obj):
        stats = self.get_stats(obj)
        return [k for k, v in stats.items() if v >= 75]

    def get_faiblesses(self, obj):
        stats = self.get_stats(obj)
        return [k for k, v in stats.items() if v <= 50]