import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os

class RecommendationModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = None
        self.user_features = None
        self.course_features = None
        self.is_trained = False
        
    def load_or_train(self, data_path='ia_module/data'):
        """Charge un modèle existant ou en entraîne un nouveau"""
        model_path = os.path.join(data_path, 'recommendation_model.pkl')
        
        if os.path.exists(model_path):
            self.load_model(model_path)
        else:
            self.train(data_path)
            self.save_model(model_path)
    
    def train(self, data_path):
        """Entraîne le modèle de recommandation"""
        # Charger les données
        users_df = pd.read_csv(os.path.join(data_path, 'users_data.csv'))
        courses_df = pd.read_csv(os.path.join(data_path, 'courses_data.csv'))
        
        # Préparer les features utilisateur
        user_features = pd.get_dummies(users_df[['skill_level', 'favorite_game']])
        user_features['hours_played'] = users_df['hours_played']
        user_features['win_rate'] = users_df['win_rate']
        user_features['games_played'] = users_df.get('games_played', 50)
        
        # Normaliser
        self.user_features = self.scaler.fit_transform(user_features)
        
        # Entraîner le modèle KNN
        self.model = NearestNeighbors(n_neighbors=10, metric='euclidean', algorithm='auto')
        self.model.fit(self.user_features)
        
        # Préparer les features des cours
        course_features = pd.get_dummies(courses_df[['category', 'difficulty']])
        course_features['popularity'] = courses_df['popularity']
        course_features['rating'] = courses_df['rating']
        self.course_features = course_features.values
        
        self.is_trained = True
        
        # Stocker les dataframes pour référence
        self.users_df = users_df
        self.courses_df = courses_df
        
    def get_recommendations(self, user_id, top_n=5):
        """Obtient des recommandations pour un utilisateur"""
        if not self.is_trained:
            return []
            
        # Trouver l'utilisateur
        user_idx = self.users_df[self.users_df['user_id'] == user_id].index
        if len(user_idx) == 0:
            return []
        
        user_idx = user_idx[0]
        user_features = self.user_features[user_idx].reshape(1, -1)
        
        # Trouver les voisins
        distances, indices = self.model.kneighbors(user_features, n_neighbors=top_n + 1)
        
        recommendations = []
        for i, idx in enumerate(indices[0][1:]):  # Skip the user itself
            if idx < len(self.users_df):
                similar_user = self.users_df.iloc[idx]
                recommendations.append({
                    'user_id': int(similar_user['user_id']),
                    'username': similar_user.get('username', f'Player_{similar_user["user_id"]}'),
                    'skill_level': similar_user['skill_level'],
                    'favorite_game': similar_user['favorite_game'],
                    'similarity_score': float(1 - distances[0][i+1]),
                    'hours_played': int(similar_user['hours_played'])
                })
        
        # Ajouter des recommandations de cours
        course_recs = self.get_course_recommendations(user_id)
        
        return {
            'user_recommendations': recommendations,
            'course_recommendations': course_recs
        }
    
    def get_course_recommendations(self, user_id):
        """Recommande des cours basés sur le niveau et les préférences"""
        user = self.users_df[self.users_df['user_id'] == user_id]
        if len(user) == 0:
            return []
            
        skill_level = user.iloc[0]['skill_level']
        favorite_game = user.iloc[0]['favorite_game']
        
        # Filtrer les cours par niveau
        recommended_courses = self.courses_df[
            (self.courses_df['difficulty'] == skill_level) |
            (self.courses_df['category'] == 'Esport')
        ].copy()
        
        # Trier par popularité et rating
        recommended_courses = recommended_courses.sort_values(
            ['popularity', 'rating'], 
            ascending=[False, False]
        ).head(5)
        
        return recommended_courses.to_dict('records')
    
    def save_model(self, path):
        """Sauvegarde le modèle"""
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'user_features': self.user_features,
            'course_features': self.course_features,
            'users_df': self.users_df,
            'courses_df': self.courses_df
        }, path)
    
    def load_model(self, path):
        """Charge un modèle sauvegardé"""
        data = joblib.load(path)
        self.model = data['model']
        self.scaler = data['scaler']
        self.user_features = data['user_features']
        self.course_features = data['course_features']
        self.users_df = data['users_df']
        self.courses_df = data['courses_df']
        self.is_trained = True