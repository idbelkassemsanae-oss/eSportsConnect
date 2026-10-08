import re
import json
import random
from datetime import datetime

class ChatbotService:
    def __init__(self):
        self.context = {}
        self.intents = self._load_intents()
        
    def _load_intents(self):
        """Définit les intents du chatbot"""
        return {
            'greeting': {
                'patterns': ['bonjour', 'salut', 'hello', 'hey', 'coucou'],
                'responses': [
                    "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
                    "Salut ! Que puis-je faire pour vous ?",
                    "Bonjour ! Bienvenue sur eSportsConnect !"
                ]
            },
            'tournament': {
                'patterns': ['tournoi', 'tournament', 'compétition', 'inscrire tournoi', 'match'],
                'responses': [
                    "Les tournois sont disponibles dans la section Tournois. Vous pouvez vous inscrire et consulter les détails des compétitions à venir.",
                    "Pour participer à un tournoi, allez dans l'onglet Tournois et choisissez celui qui vous intéresse.",
                    "Les inscriptions aux tournois se font en ligne. Vérifiez les dates et les règles avant de vous inscrire."
                ]
            },
            'coaching': {
                'patterns': ['coach', 'cours', 'formation', 'entraînement', 'apprendre', 'vidéo'],
                'responses': [
                    "Les cours sont disponibles dans la section Cours. Vous y trouverez des vidéos classées par catégorie et niveau.",
                    "Nos coaches proposent des cours en ligne pour tous les niveaux. Consultez la section Cours pour vous inscrire.",
                    "Vous pouvez suivre des séances de coaching personnalisées selon votre niveau et vos objectifs."
                ]
            },
            'leaderboard': {
                'patterns': ['classement', 'leaderboard', 'rang', 'score', 'badge'],
                'responses': [
                    "Le classement est disponible dans la section Classement. Vous pouvez voir votre position et celle des autres joueurs.",
                    "Les badges sont attribués en fonction de vos performances. Plus vous jouez, plus vous pouvez progresser !",
                    "Consultez le classement pour voir les meilleurs joueurs et suivez votre progression."
                ]
            },
            'profile': {
                'patterns': ['profil', 'compte', 'inscription', 'créer compte', 's\'inscrire'],
                'responses': [
                    "Pour créer un compte, cliquez sur le bouton Inscription. Remplissez le formulaire avec vos informations.",
                    "Vous pouvez compléter votre profil avec vos jeux préférés, votre niveau et ajouter des informations supplémentaires.",
                    "Les coaches doivent fournir un diplôme de qualification lors de l'inscription."
                ]
            },
            'game': {
                'patterns': ['jeu', 'game', 'jouer', 'esport', 'compétition'],
                'responses': [
                    "Notre plateforme supporte plusieurs jeux eSport : League of Legends, CS:GO, Dota 2, Valorant, et bien d'autres.",
                    "Vous pouvez ajouter vos statistiques de jeu et suivre votre progression sur votre profil de jeu.",
                    "Les tournois sont organisés pour différents jeux. Consultez la liste disponible dans la section Tournois."
                ]
            },
            'help': {
                'patterns': ['aide', 'help', 'assistance', 'soutien', 'problème'],
                'responses': [
                    "Besoin d'aide ? Consultez la documentation ou posez votre question, je suis là pour vous aider !",
                    "N'hésitez pas à poser votre question, je vais essayer de vous aider au mieux.",
                    "Pour toute assistance, vous pouvez me poser une question précise sur la plateforme."
                ]
            },
            'bye': {
                'patterns': ['au revoir', 'bye', 'à plus', 'salut', 'adieu'],
                'responses': [
                    "Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions.",
                    "À bientôt sur eSportsConnect ! Bonne continuation dans vos entraînements.",
                    "Bye ! Nous sommes toujours là si vous avez besoin d'aide."
                ]
            }
        }
    
    def get_response(self, message, user_id=None):
        """Génère une réponse basée sur le message de l'utilisateur"""
        message_lower = message.lower()
        
        # Vérifier l'intent
        for intent_name, intent_data in self.intents.items():
            for pattern in intent_data['patterns']:
                if pattern in message_lower:
                    response = random.choice(intent_data['responses'])
                    return {
                        'response': response,
                        'intent': intent_name,
                        'confidence': 0.9
                    }
        
        # Si aucun intent n'est trouvé
        default_responses = [
            "Je comprends votre question. Pourriez-vous la reformuler plus précisément ?",
            "Intéressant ! Pouvez-vous me donner plus de détails sur ce que vous cherchez ?",
            "Je ne suis pas sûr de comprendre. Essayez de poser votre question différemment.",
            "Sur eSportsConnect, nous proposons des tournois, des cours, un classement et un système de messagerie. Que voulez-vous faire ?"
        ]
        
        return {
            'response': random.choice(default_responses),
            'intent': 'unknown',
            'confidence': 0.3
        }
    
    def get_contextual_response(self, message, context):
        """Génère une réponse contextuelle"""
        # Simuler une conversation contextuelle
        if 'tournoi' in message.lower() or 'match' in message.lower():
            if 'date' in message.lower() or 'quand' in message.lower():
                return "Les prochains tournois auront lieu ce weekend. Consultez la section Tournois pour les dates exactes."
            elif 'inscrire' in message.lower() or 'participer' in message.lower():
                return "Pour vous inscrire, allez dans la section Tournois, sélectionnez un tournoi et cliquez sur 'S'inscrire'."
        
        return self.get_response(message)