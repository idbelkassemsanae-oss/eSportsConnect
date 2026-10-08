import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import re
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer

class DataProcessor:
    """
    Classe principale pour le traitement des données
    """
    
    def __init__(self):
        self.label_encoders = {}
        self.scalers = {}
        self.imputers = {}
        
    def clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Nettoie un DataFrame (valeurs manquantes, doublons, etc.)
        """
        df = df.copy()
        
        # Supprimer les doublons
        df = df.drop_duplicates()
        
        # Supprimer les colonnes avec trop de valeurs manquantes
        threshold = len(df) * 0.5
        df = df.dropna(axis=1, thresh=threshold)
        
        # Remplir les valeurs manquantes
        for col in df.columns:
            if df[col].dtype in ['float64', 'int64']:
                df[col] = df[col].fillna(df[col].median())
            elif df[col].dtype == 'object':
                df[col] = df[col].fillna('unknown')
            elif df[col].dtype == 'bool':
                df[col] = df[col].fillna(False)
                
        return df
    
    def normalize_column_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Normalise les noms de colonnes (minuscules, sans espaces, etc.)
        """
        df = df.copy()
        df.columns = [self._normalize_name(col) for col in df.columns]
        return df
    
    def _normalize_name(self, name: str) -> str:
        """
        Normalise un nom de colonne
        """
        name = str(name).lower().strip()
        name = re.sub(r'[^\w\s]', '', name)
        name = re.sub(r'\s+', '_', name)
        return name
    
    def encode_categorical(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        """
        Encode les colonnes catégorielles
        """
        df = df.copy()
        
        for col in columns:
            if col in df.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    # Utiliser l'encodeur existant
                    try:
                        df[col] = self.label_encoders[col].transform(df[col].astype(str))
                    except:
                        # Si de nouvelles catégories apparaissent, les ajouter
                        current_classes = set(self.label_encoders[col].classes_)
                        new_classes = set(df[col].astype(str).unique())
                        all_classes = current_classes.union(new_classes)
                        
                        # Re-fit l'encodeur avec toutes les classes
                        self.label_encoders[col] = LabelEncoder()
                        self.label_encoders[col].fit(list(all_classes))
                        df[col] = self.label_encoders[col].transform(df[col].astype(str))
                        
        return df
    
    def scale_features(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        """
        Normalise les colonnes numériques
        """
        df = df.copy()
        
        for col in columns:
            if col in df.columns:
                if col not in self.scalers:
                    self.scalers[col] = StandardScaler()
                    df[col] = self.scalers[col].fit_transform(df[[col]])
                else:
                    df[col] = self.scalers[col].transform(df[[col]])
                    
        return df
    
    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Crée des features supplémentaires utiles pour les modèles
        """
        df = df.copy()
        
        # Exemple : créer des ratios
        if 'wins' in df.columns and 'losses' in df.columns:
            df['win_loss_ratio'] = df['wins'] / (df['losses'] + 1)
            
        if 'kills' in df.columns and 'deaths' in df.columns:
            df['kda_ratio'] = df['kills'] / (df['deaths'] + 1)
            
        # Exemple : catégoriser des variables continues
        if 'hours_played' in df.columns:
            bins = [0, 50, 200, 500, 1000, float('inf')]
            labels = ['novice', 'casual', 'regular', 'hardcore', 'addict']
            df['experience_level'] = pd.cut(df['hours_played'], bins=bins, labels=labels)
            
        if 'win_rate' in df.columns:
            bins = [0, 0.3, 0.45, 0.55, 0.7, 1.0]
            labels = ['struggling', 'learning', 'balanced', 'skilled', 'dominating']
            df['performance_tier'] = pd.cut(df['win_rate'], bins=bins, labels=labels)
            
        return df
    
    def aggregate_match_stats(self, matches_df: pd.DataFrame) -> pd.DataFrame:
        """
        Agrège les statistiques des matchs par joueur
        """
        # Statistiques pour le joueur 1
        stats_p1 = matches_df.groupby('player1_id').agg({
            'score_player1': ['sum', 'mean', 'count'],
            'score_player2': ['sum', 'mean']
        }).reset_index()
        stats_p1.columns = ['player_id', 'total_points_for', 'avg_points_for', 'matches_played', 'total_points_against', 'avg_points_against']
        
        # Statistiques pour le joueur 2
        stats_p2 = matches_df.groupby('player2_id').agg({
            'score_player2': ['sum', 'mean', 'count'],
            'score_player1': ['sum', 'mean']
        }).reset_index()
        stats_p2.columns = ['player_id', 'total_points_for', 'avg_points_for', 'matches_played', 'total_points_against', 'avg_points_against']
        
        # Combiner les statistiques
        all_stats = pd.concat([stats_p1, stats_p2])
        all_stats = all_stats.groupby('player_id').agg({
            'total_points_for': 'sum',
            'avg_points_for': 'mean',
            'matches_played': 'sum',
            'total_points_against': 'sum',
            'avg_points_against': 'mean'
        }).reset_index()
        
        # Calculer des métriques supplémentaires
        all_stats['points_differential'] = all_stats['total_points_for'] - all_stats['total_points_against']
        all_stats['avg_points_differential'] = all_stats['avg_points_for'] - all_stats['avg_points_against']
        
        return all_stats

class DataValidator:
    """
    Classe pour valider les données
    """
    
    @staticmethod
    def validate_user_data(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Valide les données d'un utilisateur
        """
        errors = []
        
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                errors.append(f"Le champ '{field}' est requis")
                
        # Valider l'email
        if 'email' in data and data['email']:
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, data['email']):
                errors.append("Format d'email invalide")
                
        # Valider le mot de passe
        if 'password' in data and data['password']:
            if len(data['password']) < 8:
                errors.append("Le mot de passe doit contenir au moins 8 caractères")
                
        # Valider les champs optionnels
        if 'age' in data and data['age']:
            try:
                age = int(data['age'])
                if age < 13:
                    errors.append("L'utilisateur doit avoir au moins 13 ans")
                elif age > 120:
                    errors.append("Âge invalide")
            except ValueError:
                errors.append("L'âge doit être un nombre")
                
        return len(errors) == 0, errors
    
    @staticmethod
    def validate_course_data(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Valide les données d'un cours
        """
        errors = []
        
        required_fields = ['title', 'description', 'category', 'coach_id']
        for field in required_fields:
            if field not in data or not data[field]:
                errors.append(f"Le champ '{field}' est requis")
                
        # Valider la durée
        if 'duration' in data and data['duration']:
            try:
                duration = int(data['duration'])
                if duration <= 0:
                    errors.append("La durée doit être positive")
                elif duration > 240:
                    errors.append("La durée ne peut pas dépasser 4 heures")
            except ValueError:
                errors.append("La durée doit être un nombre")
                
        # Valider le prix
        if 'price' in data and data['price']:
            try:
                price = float(data['price'])
                if price < 0:
                    errors.append("Le prix ne peut pas être négatif")
            except ValueError:
                errors.append("Le prix doit être un nombre")
                
        return len(errors) == 0, errors
    
    @staticmethod
    def validate_tournament_data(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Valide les données d'un tournoi
        """
        errors = []
        
        required_fields = ['title', 'game', 'max_players', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data or not data[field]:
                errors.append(f"Le champ '{field}' est requis")
                
        # Valider les dates
        if 'start_date' in data and 'end_date' in data:
            try:
                start = datetime.fromisoformat(data['start_date'])
                end = datetime.fromisoformat(data['end_date'])
                
                if start >= end:
                    errors.append("La date de début doit être avant la date de fin")
                    
                if start < datetime.now():
                    errors.append("La date de début ne peut pas être dans le passé")
            except ValueError:
                errors.append("Format de date invalide")
                
        # Valider le nombre de joueurs
        if 'max_players' in data and data['max_players']:
            try:
                max_players = int(data['max_players'])
                if max_players < 2:
                    errors.append("Il faut au moins 2 joueurs")
                elif max_players > 64:
                    errors.append("Le nombre maximum de joueurs est 64")
            except ValueError:
                errors.append("Le nombre de joueurs doit être un nombre")
                
        return len(errors) == 0, errors

class DataTransformer:
    """
    Classe pour transformer les données entre différents formats
    """
    
    @staticmethod
    def dict_to_dataframe(data: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Convertit une liste de dictionnaires en DataFrame
        """
        return pd.DataFrame(data)
    
    @staticmethod
    def dataframe_to_dict(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Convertit un DataFrame en liste de dictionnaires
        """
        return df.to_dict('records')
    
    @staticmethod
    def json_to_dataframe(json_data: str) -> pd.DataFrame:
        """
        Convertit une chaîne JSON en DataFrame
        """
        data = json.loads(json_data)
        return pd.DataFrame(data)
    
    @staticmethod
    def dataframe_to_json(df: pd.DataFrame) -> str:
        """
        Convertit un DataFrame en chaîne JSON
        """
        return df.to_json(orient='records')
    
    @staticmethod
    def prepare_features_for_model(df: pd.DataFrame, 
                                   categorical_features: List[str],
                                   numerical_features: List[str]) -> np.ndarray:
        """
        Prépare les features pour un modèle
        """
        # Traiter les catégories
        cat_encoded = pd.get_dummies(df[categorical_features], prefix=categorical_features)
        
        # Traiter les numériques
        num_df = df[numerical_features].copy()
        
        # Normaliser les numériques
        scaler = StandardScaler()
        num_scaled = scaler.fit_transform(num_df)
        num_scaled_df = pd.DataFrame(num_scaled, columns=numerical_features)
        
        # Combiner
        final_df = pd.concat([cat_encoded, num_scaled_df], axis=1)
        
        return final_df.values
    
    @staticmethod
    def split_train_test(features: np.ndarray, 
                         labels: np.ndarray, 
                         test_size: float = 0.2,
                         random_state: int = 42) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Sépare les données en ensembles d'entraînement et de test
        """
        from sklearn.model_selection import train_test_split
        return train_test_split(features, labels, test_size=test_size, random_state=random_state)
    
    @staticmethod
    def create_time_features(df: pd.DataFrame, date_column: str) -> pd.DataFrame:
        """
        Crée des features temporelles à partir d'une colonne de date
        """
        df = df.copy()
        
        if date_column in df.columns:
            df[date_column] = pd.to_datetime(df[date_column])
            
            df['year'] = df[date_column].dt.year
            df['month'] = df[date_column].dt.month
            df['day'] = df[date_column].dt.day
            df['dayofweek'] = df[date_column].dt.dayofweek
            df['quarter'] = df[date_column].dt.quarter
            df['is_weekend'] = df[date_column].dt.dayofweek.isin([5, 6]).astype(int)
            
        return df
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Normalise un texte (minuscules, suppression des accents, etc.)
        """
        if not text:
            return ""
            
        # Mettre en minuscules
        text = text.lower()
        
        # Supprimer les accents
        import unicodedata
        text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8')
        
        # Supprimer la ponctuation
        text = re.sub(r'[^\w\s]', '', text)
        
        # Supprimer les espaces multiples
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

# Fonctions utilitaires supplémentaires

def load_data_from_csv(file_path: str) -> Optional[pd.DataFrame]:
    """
    Charge des données depuis un fichier CSV avec gestion d'erreurs
    """
    try:
        if os.path.exists(file_path):
            return pd.read_csv(file_path)
        else:
            print(f"Fichier non trouvé: {file_path}")
            return None
    except Exception as e:
        print(f"Erreur lors du chargement de {file_path}: {str(e)}")
        return None

def save_data_to_csv(df: pd.DataFrame, file_path: str) -> bool:
    """
    Sauvegarde un DataFrame dans un fichier CSV
    """
    try:
        # Créer le dossier si nécessaire
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        df.to_csv(file_path, index=False)
        return True
    except Exception as e:
        print(f"Erreur lors de la sauvegarde de {file_path}: {str(e)}")
        return False

def generate_sample_data(n_samples: int = 100) -> pd.DataFrame:
    """
    Génère des données d'exemple pour les tests
    """
    np.random.seed(42)
    
    games = ['League of Legends', 'CS:GO', 'Dota 2', 'Valorant', 'Overwatch']
    skill_levels = ['beginner', 'intermediate', 'advanced', 'expert', 'professional']
    
    data = {
        'user_id': list(range(1, n_samples + 1)),
        'username': [f'Player_{i}' for i in range(1, n_samples + 1)],
        'favorite_game': np.random.choice(games, n_samples),
        'skill_level': np.random.choice(skill_levels, n_samples, p=[0.3, 0.3, 0.2, 0.15, 0.05]),
        'hours_played': np.random.randint(10, 1000, n_samples),
        'games_played': np.random.randint(20, 500, n_samples),
        'wins': np.random.randint(10, 300, n_samples),
        'losses': np.random.randint(5, 200, n_samples),
        'kills': np.random.randint(0, 1000, n_samples),
        'deaths': np.random.randint(0, 800, n_samples),
        'assists': np.random.randint(0, 1200, n_samples),
        'win_rate': np.random.uniform(0.2, 0.8, n_samples),
        'kda_ratio': np.random.uniform(0.5, 5.0, n_samples),
        'rating': np.random.uniform(1, 5, n_samples),
        'created_at': [datetime.now() - timedelta(days=np.random.randint(0, 365)) for _ in range(n_samples)]
    }
    
    return pd.DataFrame(data)

# Fonction pour la validation en production
def validate_production_data(data: Dict[str, Any], schema: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Valide des données selon un schéma donné
    """
    errors = []
    
    for field, rules in schema.items():
        # Vérifier si le champ est présent
        if rules.get('required', False) and field not in data:
            errors.append(f"Le champ '{field}' est requis")
            continue
            
        if field in data:
            value = data[field]
            
            # Vérifier le type
            if 'type' in rules:
                expected_type = rules['type']
                if expected_type == 'int':
                    if not isinstance(value, (int, float)):
                        try:
                            data[field] = int(value)
                        except:
                            errors.append(f"Le champ '{field}' doit être un nombre entier")
                elif expected_type == 'float':
                    if not isinstance(value, (int, float)):
                        try:
                            data[field] = float(value)
                        except:
                            errors.append(f"Le champ '{field}' doit être un nombre")
                elif expected_type == 'str':
                    if not isinstance(value, str):
                        errors.append(f"Le champ '{field}' doit être une chaîne de caractères")
                elif expected_type == 'bool':
                    if not isinstance(value, bool):
                        errors.append(f"Le champ '{field}' doit être un booléen")
                elif expected_type == 'list':
                    if not isinstance(value, list):
                        errors.append(f"Le champ '{field}' doit être une liste")
                        
            # Vérifier les valeurs autorisées
            if 'allowed' in rules and value not in rules['allowed']:
                errors.append(f"Le champ '{field}' doit être une des valeurs autorisées: {rules['allowed']}")
                
            # Vérifier la longueur
            if 'min_length' in rules and len(str(value)) < rules['min_length']:
                errors.append(f"Le champ '{field}' doit contenir au moins {rules['min_length']} caractères")
                
            if 'max_length' in rules and len(str(value)) > rules['max_length']:
                errors.append(f"Le champ '{field}' ne peut pas dépasser {rules['max_length']} caractères")
                
            # Vérifier les valeurs min/max
            if 'min' in rules and value < rules['min']:
                errors.append(f"Le champ '{field}' doit être supérieur ou égal à {rules['min']}")
                
            if 'max' in rules and value > rules['max']:
                errors.append(f"Le champ '{field}' doit être inférieur ou égal à {rules['max']}")
    
    return len(errors) == 0, errors