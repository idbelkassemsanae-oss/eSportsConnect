from rest_framework import serializers
from .models import Tournament, TournamentRegistration, Match, LeaderboardEntry, Team


class MatchSerializer(serializers.ModelSerializer):
    player1_username = serializers.CharField(source='player1.username', read_only=True)
    player2_username = serializers.CharField(source='player2.username', read_only=True)
    team1_name = serializers.CharField(source='team1.name', read_only=True)
    team2_name = serializers.CharField(source='team2.name', read_only=True)
    winner = serializers.SerializerMethodField()
    score_player1 = serializers.SerializerMethodField()
    score_player2 = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = [
            'id',
            'player1', 'player1_username',
            'player2', 'player2_username',
            'team1', 'team1_name',
            'team2', 'team2_name',
            'winner_team', 'winner_player',
            'winner',
            'scores',
            'score_player1', 'score_player2',
            'required_sets', 'is_complete', 'played_at',
            'round_name', 'round_number', 'match_number'
        ]

    def get_winner(self, obj):
        if obj.winner_player:
            return obj.winner_player.username
        elif obj.winner_team:
            return obj.winner_team.name
        return None

    def get_score_player1(self, obj):
        if obj.scores and isinstance(obj.scores, list) and len(obj.scores) > 0:
            try:
                total = sum(1 for s in obj.scores if s.get('player1', 0) > s.get('player2', 0))
                return total
            except:
                return 0
        return 0

    def get_score_player2(self, obj):
        if obj.scores and isinstance(obj.scores, list) and len(obj.scores) > 0:
            try:
                total = sum(1 for s in obj.scores if s.get('player2', 0) > s.get('player1', 0))
                return total
            except:
                return 0
        return 0


class TournamentRegistrationSerializer(serializers.ModelSerializer):
    player_username = serializers.CharField(source='player.username', read_only=True)

    class Meta:
        model = TournamentRegistration
        fields = ['id', 'player', 'player_username', 'registered_at']


class TournamentSerializer(serializers.ModelSerializer):
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    participants_count = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    matches = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            'id', 'name', 'game', 'category', 'description', 'rules', 'level',
            'tournament_format', 'match_format', 'format', 'max_participants',
            'start_date', 'end_date', 'registration_deadline', 'status',
            'prize_pool', 'organizer_username',

            # ✅ TOUS LES CHAMPS SONT ICI
            'lieu', 'platform', 'image', 'organisateur',

            'participants_count', 'participants', 'matches', 'created_at'
        ]

    def get_participants_count(self, obj):
        return obj.registrations.count()

    def get_participants(self, obj):
        registrations = TournamentRegistration.objects.filter(tournament=obj)
        return TournamentRegistrationSerializer(registrations, many=True).data

    def get_matches(self, obj):
        matches = Match.objects.filter(tournament=obj)
        return MatchSerializer(matches, many=True).data


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    player_username = serializers.CharField(source='player.username', read_only=True)

    class Meta:
        model = LeaderboardEntry
        fields = ['id', 'player', 'player_username', 'points', 'rank']