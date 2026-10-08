import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

class SkillPredictor:
    def __init__(self):
        self.model = None
        self.feature_names = []
        self.is_trained = False
        
    def load_or_train(self, data_path='ia_module/data'):
        """Charge ou entraîne le modèle de prédiction"""
        model_path = os.path.join(data_path, 'skill_predictor.pkl')
        
        if os.path.exists(model_path):
            self.load_model(model_path)
        else:
            self.train(data_path)
            self.save_model(model_path)
    
    def train(self, data_path):
        """Entraîne le modèle de prédiction du niveau"""
        # Créer des données d'entraînement synthétiques
        np.random.seed(42)
        n_samples = 1000
        
        # Générer des données
        data = {
            'games_played': np.random.randint(10, 500, n_samples),
            'win_rate': np.random.uniform(0.2, 0.8, n_samples),
            'avg_kills': np.random.randint(0, 20, n_samples),
            'avg_deaths': np.random.randint(0, 15, n_samples),
            'avg_assists': np.random.randint(0, 25, n_samples),
            'avg_cs': np.random.randint(50, 300, n_samples),
            'avg_damage': np.random.randint(5000, 30000, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Calculer le niveau cible
        scores = []
        for _, row in df.iterrows():
            score = 0
            score += row['games_played'] / 500 * 20
            score += row['win_rate'] * 40
            score += (row['avg_kills'] / 20) * 10
            score += (row['avg_cs'] / 300) * 10
            score += (row['avg_damage'] / 30000) * 10
            scores.append(score)
        
        scores = np.array(scores)
        
        # Classifier le niveau
        levels = []
        for score in scores:
            if score >= 70:
                levels.append('professional')
            elif score >= 55:
                levels.append('expert')
            elif score >= 40:
                levels.append('advanced')
            elif score >= 25:
                levels.append('intermediate')
            else:
                levels.append('beginner')
        
        df['skill_level'] = levels
        self.feature_names = [col for col in df.columns if col != 'skill_level']
        
        # Préparer les données
        X = df[self.feature_names]
        y = df['skill_level']
        
        # Encoder les labels
        from sklearn.preprocessing import LabelEncoder
        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Entraîner le modèle
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )
        
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.model.fit(X_train, y_train)
        
        # Évaluer
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Modèle entraîné avec une précision de {accuracy:.2f}")
        print(classification_report(y_test, y_pred, target_names=self.label_encoder.classes_))
        
        self.is_trained = True
        
    def predict(self, stats):
        """Prédit le niveau de compétence"""
        if not self.is_trained:
            return None
        
        # Créer le vecteur de features
        features = np.array([[
            stats.get('games_played', 50),
            stats.get('win_rate', 0.5),
            stats.get('avg_kills', 5),
            stats.get('avg_deaths', 5),
            stats.get('avg_assists', 8),
            stats.get('avg_cs', 150),
            stats.get('avg_damage', 15000)
        ]])
        
        # Prédire
        prediction = self.model.predict(features)
        level = self.label_encoder.inverse_transform(prediction)[0]
        
        # Obtenir les probabilités
        probabilities = self.model.predict_proba(features)[0]
        confidence = np.max(probabilities)
        
        # Calculer un score
        score = self._calculate_score(stats)
        
        return {
            'skill_level': level,
            'confidence': float(confidence),
            'score': score,
            'badge': self._get_badge(level)
        }
    
    def _calculate_score(self, stats):
        """Calcule un score numérique"""
        score = 0
        score += stats.get('games_played', 0) / 500 * 20
        score += stats.get('win_rate', 0.5) * 40
        score += stats.get('avg_kills', 0) / 20 * 10
        score += stats.get('avg_cs', 0) / 300 * 10
        score += stats.get('avg_damage', 0) / 30000 * 10
        return min(score, 100)
    
    def _get_badge(self, level):
        """Retourne l'emoji du badge"""
        badges = {
            'professional': '🏆 Pro',
            'expert': '🥇 Expert',
            'advanced': '🥈 Avancé',
            'intermediate': '🥉 Intermédiaire',
            'beginner': '⭐ Débutant'
        }
        return badges.get(level, '⭐ Débutant')
    
    def save_model(self, path):
        """Sauvegarde le modèle"""
        joblib.dump({
            'model': self.model,
            'label_encoder': self.label_encoder,
            'feature_names': self.feature_names
        }, path)
    
    def load_model(self, path):
        """Charge le modèle"""
        data = joblib.load(path)
        self.model = data['model']
        self.label_encoder = data['label_encoder']
        self.feature_names = data['feature_names']
        self.is_trained = True