from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction
from django.db.models import Q, Count, Sum, Avg
from .serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# ============================================================
# INSCRIPTION D'UN JOUEUR
# ============================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def register_player(request):
    data = request.data.copy()
    data['role'] = 'player'
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        if 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']
            user.save()
        return Response({"message": "Joueur créé avec succès", "user_id": user.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============================================================
# INSCRIPTION D'UN COACH
# ============================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def register_coach(request):
    data = request.data.copy()
    data['role'] = 'coach'
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        with transaction.atomic():
            user = serializer.save()
            if 'avatar' in request.FILES:
                user.avatar = request.FILES['avatar']
                user.save()
            from coaching.models import CoachProfile
            coach_profile_data = {
                'user': user,
                'specialty': data.get('specialty', ''),
                'mastered_games': data.get('mastered_games', ''),
                'experience_years': int(data.get('experience_years_coach', data.get('experience_years', 0) or 0)),
                'skill_level': data.get('coach_skill_level', 'intermediaire'),
                'bio': data.get('coach_bio', data.get('bio', '')),
                'hourly_rate': float(data.get('hourly_rate', 0) or 0),
                'availability': ','.join(data['availability']) if isinstance(data.get('availability'), list) else data.get('availability', ''),
                'portfolio_links': data.get('portfolio_links', ''),
                'phone': data.get('phone', ''),
            }
            if 'diploma' in request.FILES:
                coach_profile_data['diploma'] = request.FILES['diploma']
            if 'profile_picture' in request.FILES:
                coach_profile_data['profile_picture'] = request.FILES['profile_picture']
            CoachProfile.objects.create(**coach_profile_data)
        return Response({"message": "Coach créé avec succès", "user_id": user.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============================================================
# RÉCUPÉRER LE PROFIL (AVEC STATISTIQUES ADAPTÉES AU RÔLE)
# ============================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user

    # Données de base (communes)
    data = {
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'avatar': user.avatar.url if user.avatar else None,
        'phone': user.phone or '',
        'region': user.region or '',
        'bio': user.bio or '',
        'main_game': user.main_game or '',
        'favorite_games': user.favorite_games or '',
        'skill_level': user.skill_level or '',
        'experience_years': user.experience_years or 0,
        'objectives': user.objectives or '',
        'platform': user.platform or '',
        'tournaments_count': 0,
        'wins': 0,
        'points': 0,
        'average_score': 0,
        'diplomas': [],
    }

    # ============================================================
    # STATISTIQUES SELON LE RÔLE
    # ============================================================

    if user.role == 'player':
        # ---- STATISTIQUES DE JOUEUR (tournois) ----
        try:
            from tournaments.models import TournamentRegistration, Match, Team, LeaderboardEntry

            # Participations
            tournaments_count = TournamentRegistration.objects.filter(player=user).count()
            data['tournaments_count'] = tournaments_count

            # Victoires
            wins = 0
            solo_wins = Match.objects.filter(winner_player=user).count()
            wins += solo_wins
            user_teams = Team.objects.filter(members=user).values_list('id', flat=True)
            team_wins = Match.objects.filter(winner_team_id__in=user_teams).count()
            wins += team_wins
            data['wins'] = wins

            # Points
            points_agg = LeaderboardEntry.objects.filter(player=user).aggregate(total=Sum('points'))
            data['points'] = points_agg['total'] or 0

            # Score moyen (si disponible)
            data['average_score'] = 0

        except Exception as e:
            print(f"Erreur stats joueur: {e}")

    elif user.role == 'coach':
        # ---- STATISTIQUES DE COACH (cours, étudiants, avis) ----
        try:
            from coaching.models import Course, CourseEnrollment, Review

            # Nombre de cours créés
            courses_count = Course.objects.filter(coach=user).count()
            data['tournaments_count'] = courses_count  # Réutilisation du champ

            # Nombre d'étudiants inscrits (approuvés)
            students_count = CourseEnrollment.objects.filter(course__coach=user, status='approved').count()
            data['wins'] = students_count  # Réutilisation du champ

            # Note moyenne des avis
            avg_rating = Review.objects.filter(course__coach=user).aggregate(avg=Avg('rating'))['avg'] or 0
            data['average_score'] = round(avg_rating, 1)

            # Points = note * 10 (échelle)
            data['points'] = round(avg_rating * 10, 0)

        except Exception as e:
            print(f"Erreur stats coach: {e}")

    # ============================================================
    # INFORMATIONS SPÉCIFIQUES AU COACH (CoachProfile)
    # ============================================================
    if user.role == 'coach':
        try:
            from coaching.models import CoachProfile
            coach_profile = user.coach_profile
            data.update({
                'specialty': coach_profile.specialty or '',
                'mastered_games': coach_profile.mastered_games or '',
                'availability': coach_profile.availability or '',
                'hourly_rate': float(coach_profile.hourly_rate) if coach_profile.hourly_rate else 0,
                'portfolio_links': coach_profile.portfolio_links or '',
                'bio': coach_profile.bio or data['bio'],
                'phone': coach_profile.phone or data['phone'],
                'diplomas': [
                    {'id': d.id, 'title': d.title, 'file': d.file.url if d.file else None}
                    for d in coach_profile.diplomas.all()
                ],
            })
        except Exception:
            pass

    # DEBUG : afficher les données dans le terminal
    print(f"🔍 [DEBUG] Profil de {user.username} (rôle: {user.role}) : {data}")

    return Response(data)

# ============================================================
# MODIFICATION DU PROFIL (Joueur & Coach)
# ============================================================
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data

    try:
        # Mise à jour des champs User
        user.email = data.get('email', user.email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.phone = data.get('phone', user.phone or '')
        user.region = data.get('region', user.region or '')
        user.bio = data.get('bio', user.bio or '')
        user.main_game = data.get('main_game', user.main_game or '')
        user.favorite_games = data.get('favorite_games', user.favorite_games or '')
        user.skill_level = data.get('skill_level', user.skill_level or '')
        user.objectives = data.get('objectives', user.objectives or '')
        user.platform = data.get('platform', user.platform or '')
        
        exp = data.get('experience_years')
        if exp is not None:
            try:
                user.experience_years = int(exp)
            except ValueError:
                user.experience_years = 0

        # Gestion avatar
        if data.get('remove_avatar') == 'true' or data.get('remove_avatar') is True:
            if user.avatar:
                user.avatar.delete(save=False)
            user.avatar = None
        elif 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']

        user.save()

        # Mise à jour CoachProfile si coach
        if user.role == 'coach':
            from coaching.models import CoachProfile
            try:
                coach_profile = user.coach_profile
            except CoachProfile.DoesNotExist:
                coach_profile = CoachProfile(user=user)

            coach_profile.specialty = data.get('specialty', coach_profile.specialty or '')
            coach_profile.mastered_games = data.get('mastered_games', coach_profile.mastered_games or '')
            coach_profile.availability = data.get('availability', coach_profile.availability or '')
            coach_profile.portfolio_links = data.get('portfolio_links', coach_profile.portfolio_links or '')
            coach_profile.bio = data.get('bio', coach_profile.bio or '')
            coach_profile.phone = data.get('phone', coach_profile.phone or '')
            
            exp_coach = data.get('experience_years')
            if exp_coach is not None:
                try:
                    coach_profile.experience_years = int(exp_coach)
                except ValueError:
                    coach_profile.experience_years = 0

            rate = data.get('hourly_rate')
            if rate is not None:
                try:
                    coach_profile.hourly_rate = float(rate)
                except ValueError:
                    coach_profile.hourly_rate = 0

            if data.get('remove_profile_picture') == 'true':
                if coach_profile.profile_picture:
                    coach_profile.profile_picture.delete(save=False)
                coach_profile.profile_picture = None
            elif 'profile_picture' in request.FILES:
                coach_profile.profile_picture = request.FILES['profile_picture']

            coach_profile.save()

        return Response({'message': 'Profil mis à jour avec succès'}, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=400)

# ============================================================
# UPLOAD ET SUPPRESSION DE DIPLÔMES
# ============================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_diploma(request):
    if request.user.role != 'coach':
        return Response({"error": "Seul un coach peut ajouter un diplôme"}, status=403)

    from coaching.models import CoachProfile, CoachDiploma
    coach_profile, _ = CoachProfile.objects.get_or_create(user=request.user)
    
    file = request.FILES.get('file')
    title = request.data.get('title', 'Diplôme')
    
    if not file:
        return Response({"error": "Aucun fichier reçu"}, status=400)

    diploma = CoachDiploma.objects.create(coach_profile=coach_profile, title=title, file=file)
    return Response({'id': diploma.id, 'title': diploma.title, 'file': diploma.file.url}, status=201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_diploma(request, pk):
    from coaching.models import CoachDiploma
    
    try:
        diploma = CoachDiploma.objects.get(pk=pk, coach_profile__user=request.user)
        diploma.file.delete(save=False)
        diploma.delete()
        return Response({"message": "Diplôme supprimé"}, status=200)
    except CoachDiploma.DoesNotExist:
        return Response({"error": "Diplôme introuvable"}, status=404)

# ============================================================
# LISTE DES UTILISATEURS
# ============================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    users = User.objects.exclude(id=request.user.id)
    data = [{'id': u.id, 'username': u.username, 'role': u.role} for u in users]
    return Response(data)