from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Tournament, TournamentRegistration, Team, Match, LeaderboardEntry, Notification
from .serializers import TournamentSerializer

User = get_user_model()

# --------------------------------------------
# Vues basées sur les classes (CRUD)
# --------------------------------------------

class TournamentListCreateView(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().order_by('start_date')
        search = request.GET.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        status_param = request.GET.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        game = request.GET.get('game')
        if game:
            queryset = queryset.filter(game__icontains=game)
        format_param = request.GET.get('format')
        if format_param:
            queryset = queryset.filter(format=format_param)

        now = timezone.now()
        data = []
        for t in queryset:
            # ✅ Calculer le statut dynamiquement
            if t.start_date and now < t.start_date:
                status = 'upcoming'
            elif t.end_date and now > t.end_date:
                status = 'completed'
            elif t.start_date and t.end_date and t.start_date <= now <= t.end_date:
                status = 'ongoing'
            else:
                status = t.status

            data.append({
                'id': t.id,
                'name': t.name,
                'description': t.description,
                'start_date': t.start_date,
                'end_date': t.end_date,
                'status': status,
                'prize_pool': str(t.prize_pool),
                'max_participants': t.max_participants,
                'participants_count': t.registrations.count(),
                'format': t.format,
                'tournament_format': t.tournament_format,
                'match_format': t.match_format,
                'game': t.game,
            })
        return Response(data)

    def perform_create(self, serializer):
        if self.request.user.role != 'coach':
            raise permissions.PermissionDenied("Seul un coach peut créer un tournoi.")
        try:
            serializer.save(organizer=self.request.user)
        except Exception as e:
            raise serializers.ValidationError({"detail": f"Erreur serveur : {str(e)}"})


class TournamentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        t = self.get_object()
        
        # ✅ Calculer le statut dynamiquement
        now = timezone.now()
        if t.start_date and now < t.start_date:
            status = 'upcoming'
        elif t.end_date and now > t.end_date:
            status = 'completed'
        elif t.start_date and t.end_date and t.start_date <= now <= t.end_date:
            status = 'ongoing'
        else:
            status = t.status

        # ✅ Inclure le niveau du joueur
        participants = []
        for reg in t.registrations.all():
            player = reg.player
            level = None
            if hasattr(player, 'profile') and player.profile:
                level = player.profile.level
            elif hasattr(player, 'level'):
                level = player.level
            participants.append({
                'id': player.id,
                'username': player.username,
                'level': level or '?'
            })

        matches_data = []
        for m in Match.objects.filter(tournament=t).order_by('round_number', 'match_number'):
            matches_data.append({
                'id': m.id,
                'round_name': m.round_name,
                'team1': {'name': m.team1.name, 'id': m.team1.id} if m.team1 else {'name': m.player1.username if m.player1 else 'N/A', 'id': m.player1.id if m.player1 else None},
                'team2': {'name': m.team2.name, 'id': m.team2.id} if m.team2 else {'name': m.player2.username if m.player2 else 'N/A', 'id': m.player2.id if m.player2 else None},
                'winner': m.winner_team.name if m.winner_team else (m.winner_player.username if m.winner_player else None),
                'scores': m.scores,
                'required_sets': m.required_sets,
                'is_complete': m.is_complete,
            })

        return Response({
            'id': t.id,
            'name': t.name,
            'game': t.game,
            'category': t.category,
            'description': t.description,
            'rules': t.rules,
            'level': t.level,
            'tournament_format': t.tournament_format,
            'match_format': t.match_format,
            'format': t.format,
            'max_participants': t.max_participants,
            'start_date': t.start_date,
            'end_date': t.end_date,
            'registration_deadline': t.registration_deadline,
            'status': status,
            'prize_pool': str(t.prize_pool),
            'organizer_username': t.organizer.username if t.organizer else None,
            'lieu': t.lieu,
            'platform': t.platform,
            'image': t.image,
            'organisateur': t.organisateur,
            'created_at': t.created_at,
            'participants_count': t.registrations.count(),
            'participants': participants,
            'matches': matches_data,
        })


# --------------------------------------------
# Vues fonctionnelles (API endpoints)
# --------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_tournament(request, pk):
    tournament = get_object_or_404(Tournament, pk=pk)
    if request.user.role == 'coach':
        return Response({"error": "Un coach ne peut pas s'inscrire."}, status=400)
    registration, created = TournamentRegistration.objects.get_or_create(tournament=tournament, player=request.user)
    if created:
        Notification.objects.create(
            user=tournament.organizer,
            message=f"🏆 Le joueur {request.user.username} s'est inscrit au tournoi '{tournament.name}'."
        )
        return Response({"message": "Inscription réussie !"}, status=201)
    return Response({"message": "Déjà inscrit."}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = request.user.notifications.filter(is_read=False).order_by('-created_at')
    data = [{'id': n.id, 'message': n.message, 'created_at': n.created_at} for n in notifications]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    notification = get_object_or_404(Notification, pk=pk, user=request.user)
    notification.is_read = True
    notification.save()
    return Response({'message': 'Marquée comme lue'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tournaments(request):
    """
    Retourne les tournois auxquels le joueur est inscrit (via inscription directe ou via une équipe).
    ✅ Correction : Le statut est calculé dynamiquement.
    """
    user = request.user
    registrations = TournamentRegistration.objects.filter(player=user)
    teams = Team.objects.filter(members=user)
    tournaments = set()
    for reg in registrations:
        tournaments.add(reg.tournament)
    for team in teams:
        tournaments.add(team.tournament)

    now = timezone.now()
    data = []
    for t in tournaments:
        entry = None
        if t.format == 'solo':
            entry = LeaderboardEntry.objects.filter(tournament=t, player=user).first()
        else:
            team = Team.objects.filter(tournament=t, members=user).first()
            if team:
                entry = LeaderboardEntry.objects.filter(tournament=t, team=team).first()

        # ✅ Calculer le statut dynamiquement
        if t.start_date and now < t.start_date:
            status = 'upcoming'
        elif t.end_date and now > t.end_date:
            status = 'completed'
        elif t.start_date and t.end_date and t.start_date <= now <= t.end_date:
            status = 'ongoing'
        else:
            status = t.status

        rank_display = entry.rank if entry else None
        points = entry.points if entry else 0

        data.append({
            'id': t.id,
            'name': t.name,
            'game': t.game,               # ✅ Ajouté pour l'affichage
            'start_date': t.start_date,   # ✅ Ajouté pour l'affichage
            'status': status,             # ✅ Utiliser le statut calculé
            'my_rank': rank_display,
            'my_points': points,
        })
    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_teams(request, pk):
    tournament = get_object_or_404(Tournament, pk=pk)
    if request.method == 'GET':
        teams = Team.objects.filter(tournament=tournament)
        data = [{'id': t.id, 'name': t.name, 'members': [{'id': m.id, 'username': m.username} for m in t.members.all()]} for t in teams]
        return Response(data)
    if request.method == 'POST':
        name = request.data.get('name')
        member_ids = request.data.get('member_ids', [])
        if not name or len(member_ids) < 2:
            return Response({'error': 'Nom et au moins 2 membres requis'}, status=400)
        team = Team.objects.create(tournament=tournament, name=name)
        team.members.set(member_ids)
        return Response({'message': 'Équipe créée !', 'id': team.id}, status=201)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_matches(request, pk):
    tournament = get_object_or_404(Tournament, pk=pk)
    if request.method == 'GET':
        matches = Match.objects.filter(tournament=tournament).order_by('round_number', 'match_number')
        data = [{
            'id': m.id,
            'round_name': m.round_name,
            'team1': {'name': m.team1.name} if m.team1 else {'name': m.player1.username if m.player1 else 'N/A'},
            'team2': {'name': m.team2.name} if m.team2 else {'name': m.player2.username if m.player2 else 'N/A'},
            'winner': m.winner_team.name if m.winner_team else (m.winner_player.username if m.winner_player else None),
            'scores': m.scores,
            'required_sets': m.required_sets,
            'is_complete': m.is_complete,
        } for m in matches]
        return Response(data)

    if request.method == 'POST':
        Match.objects.filter(tournament=tournament).delete()
        participants = list(TournamentRegistration.objects.filter(tournament=tournament).select_related('player'))
        if tournament.format != 'solo':
            teams = list(Team.objects.filter(tournament=tournament))
            entities = teams
        else:
            entities = [reg.player for reg in participants]
        if len(entities) < 2:
            return Response({'error': 'Il faut au moins 2 participants/équipes'}, status=400)

        if tournament.tournament_format == 'elimination_directe':
            if len(entities) < 4:
                return Response({'error': 'Élimination directe nécessite au moins 4 participants'}, status=400)
            match_num = 1
            half_count = 1
            for i in range(0, len(entities), 2):
                if i + 1 < len(entities):
                    if tournament.format == 'solo':
                        Match.objects.create(
                            tournament=tournament,
                            match_number=match_num,
                            round_number=1,
                            round_name=f"Demi-finale {half_count}",
                            player1=entities[i],
                            player2=entities[i+1]
                        )
                    else:
                        Match.objects.create(
                            tournament=tournament,
                            match_number=match_num,
                            round_number=1,
                            round_name=f"Demi-finale {half_count}",
                            team1=entities[i],
                            team2=entities[i+1]
                        )
                    match_num += 1
                    half_count += 1
            if tournament.format == 'solo':
                Match.objects.create(
                    tournament=tournament,
                    match_number=match_num,
                    round_number=2,
                    round_name="Finale",
                    player1=None,
                    player2=None
                )
            else:
                Match.objects.create(
                    tournament=tournament,
                    match_number=match_num,
                    round_number=2,
                    round_name="Finale",
                    team1=None,
                    team2=None
                )

        # Déterminer le nombre de sets requis
        if tournament.match_format == 'bo5':
            required_sets = 3
        elif tournament.match_format == 'bo3':
            required_sets = 2
        else:
            required_sets = 1

        matches = Match.objects.filter(tournament=tournament)
        for match in matches:
            match.required_sets = required_sets
            match.save()

        # Envoyer des notifications
        for match in matches:
            if tournament.format == 'solo':
                if match.player1:
                    Notification.objects.create(user=match.player1, message=f"⚔️ Nouveau match dans {tournament.name} : {match.round_name}")
                if match.player2:
                    Notification.objects.create(user=match.player2, message=f"⚔️ Nouveau match dans {tournament.name} : {match.round_name}")
            else:
                if match.team1:
                    for member in match.team1.members.all():
                        Notification.objects.create(user=member, message=f"⚔️ Nouveau match dans {tournament.name} : {match.round_name}")
                if match.team2:
                    for member in match.team2.members.all():
                        Notification.objects.create(user=member, message=f"⚔️ Nouveau match dans {tournament.name} : {match.round_name}")

        return Response({'message': 'Matchs générés !'}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_score(request, pk, match_pk):
    tournament = get_object_or_404(Tournament, pk=pk)
    match = get_object_or_404(Match, pk=match_pk, tournament=tournament)

    # Vérifier les droits
    is_participant = False
    if tournament.format == 'solo':
        if request.user in [match.player1, match.player2]:
            is_participant = True
    else:
        if match.team1 and request.user in match.team1.members.all():
            is_participant = True
        if match.team2 and request.user in match.team2.members.all():
            is_participant = True

    if request.user.role != 'coach' and not is_participant:
        return Response({'error': 'Vous n\'êtes pas autorisé à soumettre ce score'}, status=403)

    scores_list = request.data.get('scores', [])
    if not scores_list:
        return Response({'error': 'Aucun score fourni'}, status=400)

    match.scores = scores_list
    wins1 = 0
    wins2 = 0
    for score in scores_list:
        s1 = int(score.get('team1', 0))
        s2 = int(score.get('team2', 0))
        if s1 > s2:
            wins1 += 1
        elif s2 > s1:
            wins2 += 1

    is_complete = wins1 >= match.required_sets or wins2 >= match.required_sets
    match.is_complete = is_complete
    match.played_at = timezone.now()

    if wins1 > wins2:
        if tournament.format == 'solo':
            match.winner_player = match.player1
        else:
            match.winner_team = match.team1
    elif wins2 > wins1:
        if tournament.format == 'solo':
            match.winner_player = match.player2
        else:
            match.winner_team = match.team2
    else:
        if tournament.format == 'solo':
            match.winner_player = None
        else:
            match.winner_team = None
    match.save()

    # Notifications
    if tournament.format == 'solo':
        if match.player1:
            Notification.objects.create(user=match.player1, message=f"📊 Résultat enregistré dans {tournament.name}")
        if match.player2:
            Notification.objects.create(user=match.player2, message=f"📊 Résultat enregistré dans {tournament.name}")
    else:
        if match.team1:
            for member in match.team1.members.all():
                Notification.objects.create(user=member, message=f"📊 Résultat enregistré dans {tournament.name}")
        if match.team2:
            for member in match.team2.members.all():
                Notification.objects.create(user=member, message=f"📊 Résultat enregistré dans {tournament.name}")

    # Mise à jour de la finale pour élimination directe
    if tournament.tournament_format == 'elimination_directe' and match.round_name.startswith("Demi-finale"):
        semi_finals = Match.objects.filter(tournament=tournament, round_number=1)
        if semi_finals.count() >= 2 and all(sf.winner_player or sf.winner_team for sf in semi_finals):
            final_match = Match.objects.filter(tournament=tournament, round_name="Finale").first()
            if final_match:
                winner1 = semi_finals[0].winner_team or semi_finals[0].winner_player
                winner2 = semi_finals[1].winner_team or semi_finals[1].winner_player
                if tournament.format == 'solo':
                    final_match.player1 = winner1
                    final_match.player2 = winner2
                else:
                    final_match.team1 = winner1
                    final_match.team2 = winner2
                final_match.save()

    update_leaderboard(tournament)
    return Response({'message': 'Scores enregistrés !', 'is_complete': is_complete})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard(request, pk):
    tournament = get_object_or_404(Tournament, pk=pk)
    entries = LeaderboardEntry.objects.filter(tournament=tournament).order_by('-points')
    data = []
    for e in entries:
        if tournament.format == 'solo':
            wins = Match.objects.filter(tournament=tournament, winner_player=e.player).count()
            losses = Match.objects.filter(tournament=tournament).filter(
                models.Q(player1=e.player) | models.Q(player2=e.player)
            ).exclude(winner_player=e.player).count()
            player_name = e.player.username if e.player else 'N/A'
        else:
            wins = Match.objects.filter(tournament=tournament, winner_team=e.team).count()
            losses = Match.objects.filter(tournament=tournament).filter(
                models.Q(team1=e.team) | models.Q(team2=e.team)
            ).exclude(winner_team=e.team).count()
            player_name = e.team.name if e.team else 'N/A'

        if e.points >= 10:
            level, level_color = 'Expert', 'text-red-400 border-red-500/30 bg-red-500/10'
        elif e.points >= 6:
            level, level_color = 'Avancé', 'text-orange-400 border-orange-500/30 bg-orange-500/10'
        elif e.points >= 3:
            level, level_color = 'Intermédiaire', 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
        else:
            level, level_color = 'Débutant', 'text-green-400 border-green-500/30 bg-green-500/10'

        data.append({
            'id': e.id,
            'player_name': player_name,
            'points': e.points,
            'rank': e.rank,
            'wins': wins,
            'losses': losses,
            'badge': e.badge,
            'level': level,
            'level_color': level_color,
        })
    return Response(data)


# --------------------------------------------
# CLASSEMENT GLOBAL - CORRIGÉ !
# --------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_global_leaderboard(request):
    """
    Classement global basé sur les performances réelles dans les matchs.
    Les points sont calculés comme 3 points par victoire.
    """
    # Récupérer tous les utilisateurs
    players = User.objects.all()

    leaderboard_data = []

    for player in players:
        # Matchs en solo
        solo_matches = Match.objects.filter(
            models.Q(player1=player) | models.Q(player2=player),
            is_complete=True
        )

        # Matchs en équipe
        teams = Team.objects.filter(members=player)
        team_matches = Match.objects.filter(
            models.Q(team1__in=teams) | models.Q(team2__in=teams),
            is_complete=True
        )

        all_match_ids = set(solo_matches.values_list('id', flat=True)) | set(team_matches.values_list('id', flat=True))
        total_matches = len(all_match_ids)

        wins_solo = Match.objects.filter(winner_player=player, is_complete=True).count()
        wins_team = Match.objects.filter(winner_team__in=teams, is_complete=True).count()
        wins = wins_solo + wins_team

        points = wins * 3

        # Niveau
        if points >= 20:
            level = 'Expert'
        elif points >= 10:
            level = 'Avancé'
        elif points >= 5:
            level = 'Intermédiaire'
        else:
            level = 'Débutant'

        # On n'affiche que les joueurs qui ont au moins un match ou des points
        if total_matches > 0 or points > 0:
            leaderboard_data.append({
                'player_id': player.id,
                'player_name': player.username,
                'points': points,
                'matches': total_matches,
                'wins': wins,
                'win_rate': round((wins / total_matches * 100)) if total_matches > 0 else 0,
                'level': level,
                # Tu peux ajouter 'level_color' si besoin
            })

    # Trier par points décroissants
    leaderboard_data.sort(key=lambda x: x['points'], reverse=True)

    # Attribuer rangs et badges
    for idx, entry in enumerate(leaderboard_data, start=1):
        entry['rank'] = idx
        if idx == 1:
            entry['badge'] = 'Gold'
        elif idx == 2:
            entry['badge'] = 'Silver'
        elif idx == 3:
            entry['badge'] = 'Bronze'
        else:
            entry['badge'] = None

    return Response(leaderboard_data)


# --------------------------------------------
# Fonctions internes
# --------------------------------------------
def update_leaderboard(tournament):
    """
    Met à jour le classement du tournoi : points, rang et badges.
    """
    if tournament.format == 'solo':
        players = TournamentRegistration.objects.filter(tournament=tournament).values_list('player', flat=True)
        for player_id in players:
            wins = Match.objects.filter(tournament=tournament, winner_player_id=player_id).count()
            points = wins * 3
            entry, _ = LeaderboardEntry.objects.get_or_create(tournament=tournament, player_id=player_id)
            entry.points = points
            entry.save()
    else:
        teams = Team.objects.filter(tournament=tournament)
        matches = Match.objects.filter(tournament=tournament)
        for team in teams:
            wins = matches.filter(winner_team=team).count()
            points = wins * 3
            entry, _ = LeaderboardEntry.objects.get_or_create(tournament=tournament, team=team)
            entry.points = points
            entry.save()

    entries = LeaderboardEntry.objects.filter(tournament=tournament).order_by('-points')
    for idx, entry in enumerate(entries, start=1):
        entry.rank = idx
        if idx == 1:
            entry.badge = 'Gold'
        elif idx == 2:
            entry.badge = 'Silver'
        elif idx == 3:
            entry.badge = 'Bronze'
        else:
            entry.badge = None
        entry.save()