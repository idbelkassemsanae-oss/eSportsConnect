from django.db import models
from django.conf import settings

class Tournament(models.Model):
    name = models.CharField(max_length=200)
    game = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField()
    rules = models.TextField()

    LEVEL_CHOICES = [
        ('debutant', 'Débutant'),
        ('intermediaire', 'Intermédiaire'),
        ('avance', 'Avancé'),
        ('expert', 'Expert'),
    ]
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='debutant')

    TOURNAMENT_FORMAT_CHOICES = [
        ('elimination_directe', 'Élimination directe'),
        ('double_elimination', 'Double élimination'),
        ('round_robin', 'Round Robin'),
        ('phase_de_groupes', 'Phase de groupes'),
        ('systeme_suisse', 'Système suisse'),
        ('playoffs', 'Playoffs'),
    ]
    tournament_format = models.CharField(max_length=30, choices=TOURNAMENT_FORMAT_CHOICES, default='elimination_directe')

    MATCH_FORMAT_CHOICES = [
        ('bo1', 'BO1'),
        ('bo3', 'BO3'),
        ('bo5', 'BO5'),
        ('aller_retour', 'Match aller-retour')
    ]
    match_format = models.CharField(max_length=20, choices=MATCH_FORMAT_CHOICES, default='bo1')

    FORMAT_CHOICES = [
        ('1v1', '1 vs 1'),
        ('2v2', '2 vs 2'),
        ('5v5', '5 vs 5'),
        ('solo', 'Solo')
    ]
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='1v1')

    max_participants = models.IntegerField(default=16)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    registration_deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('upcoming', 'À venir'),
            ('ongoing', 'En cours'),
            ('completed', 'Terminé')
        ],
        default='upcoming'
    )
    prize_pool = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organized_tournaments',
        limit_choices_to={'role': 'coach'}
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # ✅ NOUVEAUX CHAMPS AJOUTÉS (pour les informations du frontend)
    lieu = models.CharField(max_length=100, blank=True, null=True, default='En ligne')
    platform = models.CharField(max_length=50, blank=True, null=True, default='Toutes')
    image = models.URLField(max_length=500, blank=True, null=True)
    organisateur = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name


class TournamentRegistration(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='registrations')
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tournament_registrations')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tournament', 'player')


class Team(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='teams')
    created_at = models.DateTimeField(auto_now_add=True)


class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    round_number = models.IntegerField(default=1)
    match_number = models.IntegerField(default=1)
    round_name = models.CharField(max_length=100, default="Match")

    # Matchs par équipe
    team1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches_as_team1', null=True, blank=True)
    team2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches_as_team2', null=True, blank=True)
    winner_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_matches')

    # Matchs Solo
    player1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='matches_as_player1', null=True, blank=True)
    player2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='matches_as_player2', null=True, blank=True)
    winner_player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_solo_matches')

    # Scores
    score_team1 = models.IntegerField(default=0)
    score_team2 = models.IntegerField(default=0)
    played_at = models.DateTimeField(null=True, blank=True)

    # Champs dynamiques
    scores = models.JSONField(default=list, blank=True)
    required_sets = models.IntegerField(default=1)
    is_complete = models.BooleanField(default=False)


class LeaderboardEntry(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='leaderboard')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True, blank=True)
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='leaderboard_entries')
    points = models.IntegerField(default=0)
    rank = models.IntegerField(null=True, blank=True)
    badge = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        unique_together = ('tournament', 'team', 'player')


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"