import logging
import google.generativeai as genai
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from .serializers import PlayerStatsSerializer

logger = logging.getLogger(__name__)

# =====================================================
# CONFIGURATION DE GEMINI
# =====================================================
GEMINI_API_KEY = getattr(settings, 'GEMINI_API_KEY', '')

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-3.6-flash')
        logger.info("✅ Gemini API configurée avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur configuration Gemini : {e}")
        gemini_model = None
else:
    logger.warning("⚠️ Aucune clé API Gemini trouvée")
    gemini_model = None


# =====================================================
# FONCTION DE DÉTECTION DU CONTEXTE
# =====================================================
def is_esports_question(question):
    """
    Détecte si la question concerne la plateforme eSportsConnect
    (cours, tournois, coachs, inscriptions, etc.)
    """
    keywords = [
        'tournoi', 'cours', 'coach', 'inscrire', 'participer',
        'statistique', 'classement', 'match', 'bo3', 'bo1',
        'valorant', 'lol', 'league of legends', 'csgo',
        'esportsconnect', 'esport', 'e-sport', 'plateforme',
        'profil', 'diplôme', 'niveau', 'xp', 'points',
        'streaming', 'messagerie', 'ressource', 'guide',
        'entraînement', 'performance', 'compétition'
    ]
    question_lower = question.lower()
    return any(keyword in question_lower for keyword in keywords)


# =====================================================
# FONCTION DE RÉCUPÉRATION DES DONNÉES
# =====================================================
def get_platform_data():
    """
    Récupère les données de la plateforme (tournois, cours, coachs)
    """
    data = {
        "tournaments": "Aucun tournoi à venir pour le moment.",
        "courses": "Aucun cours disponible pour le moment.",
        "coaches": "Aucun coach disponible pour le moment."
    }
    
    # 1. TOURNOIS À VENIR
    try:
        from tournaments.models import Tournament
        tournaments = Tournament.objects.filter(
            status='upcoming',
            start_date__gt=timezone.now()
        )[:10]
        if tournaments:
            tournaments_list = []
            for t in tournaments:
                game_name = t.game if hasattr(t, 'game') and t.game else 'eSport'
                date_str = t.start_date.strftime('%d/%m/%Y') if t.start_date else 'Date à venir'
                tournaments_list.append(f"- {t.name} ({game_name}, le {date_str})")
            data["tournaments"] = "\n".join(tournaments_list)
    except Exception as e:
        logger.warning(f"Erreur chargement tournois : {e}")

    # 2. COURS DISPONIBLES
    try:
        from coaching.models import Course
        courses = Course.objects.filter(is_active=True)[:10]
        if courses:
            courses_list = []
            for c in courses:
                game_name = c.game.name if hasattr(c, 'game') and c.game else 'Général'
                difficulty = c.get_difficulty_level_display() if hasattr(c, 'get_difficulty_level_display') and c.difficulty_level else 'Débutant'
                courses_list.append(f"- {c.title} (Niveau: {difficulty}, Jeu: {game_name})")
            data["courses"] = "\n".join(courses_list)
    except Exception as e:
        logger.warning(f"Erreur chargement cours : {e}")

    # 3. COACHS DISPONIBLES
    try:
        from coaching.models import CoachProfile
        coaches = CoachProfile.objects.all()[:5]
        if coaches:
            coaches_list = []
            for c in coaches:
                specialty = c.specialty if hasattr(c, 'specialty') and c.specialty else 'Général'
                coaches_list.append(f"- Coach {c.user.username} (Spécialité: {specialty})")
            data["coaches"] = "\n".join(coaches_list)
    except Exception as e:
        logger.warning(f"Erreur chargement coachs : {e}")

    return data


@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def chatbot_ask(request):
    """
    Endpoint du chatbot utilisant Gemini.
    - Si la question concerne eSportsConnect → utilise les données de la base.
    - Sinon → réponse générique.
    """
    try:
        # Récupération du message
        if request.method == 'GET':
            question = request.GET.get('question', '') or request.GET.get('message', '')
        else:
            question = request.data.get('question', '') or request.data.get('message', '')

        question = question.strip()

        if not question:
            return Response(
                {"error": "La question ne peut pas être vide."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not gemini_model:
            return Response({
                "answer": "Le service IA n'est pas disponible. Veuillez réessayer plus tard.",
                "confidence": 0.0,
                "source": "error"
            })

        # =====================================================
        # DÉTECTION DU CONTEXTE
        # =====================================================
        if is_esports_question(question):
            # La question concerne la plateforme → utiliser les données réelles
            platform_data = get_platform_data()
            
            prompt = f"""
            Tu es un assistant intelligent pour la plateforme eSportsConnect.
            Réponds à la question de l'utilisateur en utilisant UNIQUEMENT les informations fournies ci-dessous.
            
            # DONNÉES DE LA PLATEFORME
            
            ## Tournois à venir :
            {platform_data['tournaments']}
            
            ## Cours disponibles :
            {platform_data['courses']}
            
            ## Coachs disponibles :
            {platform_data['coaches']}
            
            # QUESTION DE L'UTILISATEUR
            {question}
            
            # RÉPONSE (en français, précise et utile) :
            """
        else:
            # La question ne concerne pas la plateforme → réponse générique
            prompt = f"""
            Tu es un assistant intelligent.
            Réponds à la question de l'utilisateur de manière claire et concise en français.
            
            Question : {question}
            
            Réponse :"""

        response = gemini_model.generate_content(prompt)
        answer = response.text.strip() if response.text else "Je n'ai pas pu générer de réponse."

        return Response({
            "answer": answer,
            "confidence": 0.8,
            "source": "gemini"
        })

    except Exception as e:
        logger.exception("Erreur dans chatbot_ask")
        return Response(
            {"error": f"Erreur interne : {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def chatbot_suggestions(request):
    """Retourne une liste de suggestions de questions."""
    return Response({
        "suggestions": [
            "Quels cours sont disponibles sur eSportsConnect ?",
            "Y a-t-il des tournois à venir ?",
            "Quels coachs sont disponibles ?",
            "Comment m'inscrire à un tournoi ?",
            "Qu'est-ce qu'un BO3 ?",
            "Comment devenir coach ?"
        ]
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def personalized_recommendations(request):
    """Retourne des recommandations personnalisées pour l'utilisateur connecté."""
    return Response({
        "courses": [],
        "tournaments": [],
        "coaches": []
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_nouveautes(request):
    """Vérifie les nouveautés pour l'utilisateur."""
    return Response({"message": "Aucune nouveauté pour le moment."})


class PlayerStatsView(generics.RetrieveAPIView):
    """
    Vue pour récupérer les statistiques du joueur connecté.
    Utilisée par le Dashboard IA.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PlayerStatsSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            logger.info(f"📊 [Dashboard IA] Demandé pour: {instance.username} (ID: {instance.id})")
            serializer = self.get_serializer(instance)
            data = serializer.data
            logger.info(f"📊 [Dashboard IA] Données envoyées: {data}")
            return Response(data)
        except Exception as e:
            import traceback
            logger.exception("Erreur dans PlayerStatsView")
            return Response(
                {"error": f"Erreur interne: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )