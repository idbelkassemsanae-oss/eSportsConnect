import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

class PerformanceAnalyzer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.kmeans = None
        self.performance_thresholds = {
            'kda': {'excellent': 4.0, 'good': 2.5, 'average': 1.5},
            'win_rate': {'excellent': 0.65, 'good': 0.5, 'average': 0.4},
            'cs_per_minute': {'excellent': 8, 'good': 6, 'average': 4},
            'damage_per_minute': {'excellent': 800, 'good': 600, 'average': 400}
        }
        
    def analyze_performance(self, user_id, game_stats):
        """
        Analyse les performances du joueur
        game_stats: dict avec les statistiques du jeu
        """
        # Statistiques calculées
        stats = self._calculate_stats(game_stats)
        
        # Analyse des forces et faiblesses
        strengths, weaknesses = self._analyze_strengths_weaknesses(stats)
        
        # Score global
        overall_score = self._calculate_overall_score(stats)
        
        # Classification du niveau
        level, badge = self._classify_level(overall_score)
        
        return {
            'user_id': user_id,
            'stats': stats,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'overall_score': overall_score,
            'skill_level': level,
            'badge': badge,
            'detailed_analysis': self._get_detailed_analysis(stats),
            'improvement_tips': self._get_improvement_tips(weaknesses)
        }
    
    def _calculate_stats(self, game_stats):
        """Calcule les statistiques avancées"""
        kills = game_stats.get('kills', 0)
        deaths = game_stats.get('deaths', 1)
        assists = game_stats.get('assists', 0)
        cs = game_stats.get('cs', 0)
        damage = game_stats.get('damage', 0)
        minutes = game_stats.get('minutes_played', 30)
        wins = game_stats.get('wins', 0)
        total_games = game_stats.get('total_games', 50)
        
        return {
            'kda': (kills + assists) / max(1, deaths),
            'win_rate': wins / max(1, total_games),
            'cs_per_minute': cs / max(1, minutes),
            'damage_per_minute': damage / max(1, minutes),
            'kill_participation': (kills + assists) / max(1, game_stats.get('team_kills', 100)),
            'vision_score': game_stats.get('vision_score', 0),
            'gold_per_minute': game_stats.get('gold', 0) / max(1, minutes)
        }
    
    def _analyze_strengths_weaknesses(self, stats):
        """Analyse les forces et faiblesses"""
        strengths = []
        weaknesses = []
        
        for stat_name, value in stats.items():
            thresholds = self.performance_thresholds.get(stat_name, {})
            if thresholds:
                if value >= thresholds.get('excellent', float('inf')):
                    strengths.append(f"Excellent {stat_name} - Vous excellez dans ce domaine")
                elif value < thresholds.get('average', 0):
                    weaknesses.append(f"{stat_name} à améliorer - Entraînez-vous sur cet aspect")
        
        if not strengths:
            strengths.append("Bonnes bases - Continuez à vous entraîner régulièrement")
        
        if not weaknesses:
            weaknesses.append("Continuez à maintenir ce bon niveau de performance")
        
        return strengths, weaknesses
    
    def _calculate_overall_score(self, stats):
        """Calcule un score global de performance"""
        weights = {
            'kda': 0.25,
            'win_rate': 0.25,
            'cs_per_minute': 0.15,
            'damage_per_minute': 0.15,
            'kill_participation': 0.10,
            'vision_score': 0.10
        }
        
        score = 0
        for stat_name, weight in weights.items():
            if stat_name in stats:
                value = stats[stat_name]
                # Normaliser la valeur
                normalized = self._normalize_stat(stat_name, value)
                score += normalized * weight
        
        return min(score * 100, 100)
    
    def _normalize_stat(self, stat_name, value):
        """Normalise une statistique entre 0 et 1"""
        thresholds = self.performance_thresholds.get(stat_name, {})
        excellent = thresholds.get('excellent', 1)
        average = thresholds.get('average', 0)
        
        if value >= excellent:
            return 1.0
        elif value <= average:
            return 0.0
        else:
            return (value - average) / (excellent - average)
    
    def _classify_level(self, score):
        """Classifie le niveau du joueur"""
        if score >= 85:
            return 'professional', '🏆 Pro'
        elif score >= 70:
            return 'expert', '🥇 Expert'
        elif score >= 55:
            return 'advanced', '🥈 Avancé'
        elif score >= 40:
            return 'intermediate', '🥉 Intermédiaire'
        else:
            return 'beginner', '⭐ Débutant'
    
    def _get_detailed_analysis(self, stats):
        """Retourne une analyse détaillée"""
        analysis = []
        
        for stat_name, value in stats.items():
            thresholds = self.performance_thresholds.get(stat_name, {})
            excellent = thresholds.get('excellent', float('inf'))
            good = thresholds.get('good', float('inf'))
            average = thresholds.get('average', 0)
            
            if value >= excellent:
                status = "Excellent"
            elif value >= good:
                status = "Bon"
            elif value >= average:
                status = "Moyen"
            else:
                status = "À améliorer"
            
            analysis.append({
                'stat': stat_name,
                'value': round(value, 2),
                'status': status,
                'target': excellent
            })
        
        return analysis
    
    def _get_improvement_tips(self, weaknesses):
        """Génère des conseils d'amélioration"""
        tips = []
        
        for weakness in weaknesses:
            if 'kda' in weakness.lower():
                tips.append("Travaillez votre positionnement et la prise de décision pour améliorer votre KDA")
            elif 'win_rate' in weakness.lower():
                tips.append("Analysez vos parties pour identifier les schémas perdants")
            elif 'cs' in weakness.lower():
                tips.append("Pratiquez le farm en mode entraînement")
            elif 'damage' in weakness.lower():
                tips.append("Optimisez votre build et votre positionnement en combat")
            elif 'vision' in weakness.lower():
                tips.append("Placez plus de wards et regardez plus souvent la minimap")
        
        if not tips:
            tips.append("Continuez votre progression en variant les jeux et les rôles")
        
        return tips
    
    def cluster_players(self, players_data):
        """Regroupe les joueurs par niveau de performance"""
        features = pd.DataFrame(players_data)
        scaled_features = self.scaler.fit_transform(features[['win_rate', 'kda', 'games_played']])
        
        self.kmeans = KMeans(n_clusters=4, random_state=42)
        clusters = self.kmeans.fit_predict(scaled_features)
        
        return clusters