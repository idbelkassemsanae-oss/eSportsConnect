import pandas as pd
import numpy as np
import os
import json
from datetime import datetime, timedelta

class DataService:
    def __init__(self, data_path='ia_module/data'):
        self.data_path = data_path
        self.ensure_data_directory()
        
    def ensure_data_directory(self):
        """Crée le dossier data s'il n'existe pas"""
        if not os.path.exists(self.data_path):
            os.makedirs(self.data_path)
    
    def generate_training_data(self):
        """Génère des données d'entraînement si elles n'existent pas"""
        users_path = os.path.join(self.data_path, 'users_data.csv')
        courses_path = os.path.join(self.data_path, 'courses_data.csv')
        
        if not os.path.exists(users_path):
            self._generate_users_data()
        
        if not os.path.exists(courses_path):
            self._generate_courses_data()
    
    def _generate_users_data(self):
        """Génère des données utilisateurs factices"""
        np.random.seed(42)
        n_users = 200
        
        games = ['League of Legends', 'CS:GO', 'Dota 2', 'Valorant', 'Overwatch']
        skill_levels = ['beginner', 'intermediate', 'advanced', 'expert', 'professional']
        
        data = {
            'user_id': list(range(1, n_users + 1)),
            'username': [f'Player_{i}' for i in range(1, n_users + 1)],
            'favorite_game': np.random.choice(games, n_users),
            'skill_level': np.random.choice(skill_levels, n_users, p=[0.3, 0.3, 0.2, 0.15, 0.05]),
            'hours_played': np.random.randint(10, 1000, n_users),
            'games_played': np.random.randint(20, 500, n_users),
            'win_rate': np.random.uniform(0.2, 0.8, n_users),
            'kda': np.random.uniform(0.5, 5, n_users),
            'rating': np.random.uniform(1, 5, n_users)
        }
        
        df = pd.DataFrame(data)
        df.to_csv(os.path.join(self.data_path, 'users_data.csv'), index=False)
        
        # Générer aussi les données de matchs
        self._generate_match_data(n_users)
        
    def _generate_match_data(self, n_users):
        """Génère des données de matchs"""
        matches = []
        for i in range(1000):
            player1 = np.random.randint(1, n_users + 1)
            player2 = np.random.randint(1, n_users + 1)
            while player2 == player1:
                player2 = np.random.randint(1, n_users + 1)
            
            match = {
                'match_id': i + 1,
                'player1_id': player1,
                'player2_id': player2,
                'score_player1': np.random.randint(0, 5),
                'score_player2': np.random.randint(0, 5),
                'date': datetime.now() - timedelta(days=np.random.randint(0, 30)),
                'tournament_id': np.random.randint(1, 10)
            }
            matches.append(match)
        
        df_matches = pd.DataFrame(matches)
        df_matches.to_csv(os.path.join(self.data_path, 'match_data.csv'), index=False)
    
    def _generate_courses_data(self):
        """Génère des données de cours factices"""
        np.random.seed(42)
        n_courses = 50
        
        categories = ['Aérobic', 'Fitness', 'Karaté', 'Yoga', 'Esport']
        difficulties = ['beginner', 'intermediate', 'advanced']
        coaches = ['Coach_' + chr(65 + i) for i in range(10)]
        
        data = {
            'course_id': list(range(1, n_courses + 1)),
            'title': [f'Cours de {np.random.choice(["Esport", "Fitness", "Yoga"])} Niveau {i}' for i in range(1, n_courses + 1)],
            'category': np.random.choice(categories, n_courses),
            'difficulty': np.random.choice(difficulties, n_courses),
            'coach': np.random.choice(coaches, n_courses),
            'duration': np.random.randint(15, 120, n_courses),
            'popularity': np.random.randint(1, 100, n_courses),
            'rating': np.random.uniform(3, 5, n_courses),
            'price': np.round(np.random.uniform(0, 50, n_courses), 2),
            'is_active': np.random.choice([True, False], n_courses, p=[0.8, 0.2])
        }
        
        df = pd.DataFrame(data)
        df.to_csv(os.path.join(self.data_path, 'courses_data.csv'), index=False)
    
    def load_users_data(self):
        """Charge les données utilisateurs"""
        path = os.path.join(self.data_path, 'users_data.csv')
        if os.path.exists(path):
            return pd.read_csv(path)
        return None
    
    def load_courses_data(self):
        """Charge les données des cours"""
        path = os.path.join(self.data_path, 'courses_data.csv')
        if os.path.exists(path):
            return pd.read_csv(path)
        return None
    
    def load_match_data(self):
        """Charge les données des matchs"""
        path = os.path.join(self.data_path, 'match_data.csv')
        if os.path.exists(path):
            return pd.read_csv(path)
        return None
    
    def get_user_stats(self, user_id):
        """Récupère les statistiques d'un utilisateur"""
        users = self.load_users_data()
        if users is not None:
            user_data = users[users['user_id'] == user_id]
            if not user_data.empty:
                return user_data.iloc[0].to_dict()
        return None
    
    def get_course_recommendations(self, user_id):
        """Récupère des recommandations de cours basées sur le profil"""
        users = self.load_users_data()
        courses = self.load_courses_data()
        
        if users is None or courses is None:
            return []
        
        user = users[users['user_id'] == user_id]
        if user.empty:
            return []
        
        skill_level = user.iloc[0]['skill_level']
        
        # Filtrer les cours par niveau
        recommended = courses[courses['difficulty'] == skill_level]
        
        # Si peu de résultats, élargir
        if len(recommended) < 5:
            recommended = courses[courses['difficulty'].isin(['beginner', 'intermediate'])]
        
        # Trier par popularité et rating
        recommended = recommended.sort_values(['popularity', 'rating'], ascending=[False, False])
        
        return recommended.head(10).to_dict('records')