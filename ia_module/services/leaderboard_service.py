import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class LeaderboardService:
    def __init__(self):
        self.players = []
        self._generate_demo_data()
    
    def _generate_demo_data(self):
        """Génère des données de démonstration pour le classement"""
        np.random.seed(42)
        games = ['League of Legends', 'CS:GO', 'Dota 2', 'Valorant', 'Overwatch']
        
        for i in range(1, 21):
            player = {
                'id': i,
                'username': f'Player_{i}',
                'favorite_game': np.random.choice(games),
                'wins': np.random.randint(20, 200),
                'losses': np.random.randint(10, 150),
                'total_games': 0,  # Sera calculé
                'points': 0,  # Sera calculé
                'rank': 0
            }
            player['total_games'] = player['wins'] + player['losses']
            player['win_rate'] = player['wins'] / max(1, player['total_games'])
            player['points'] = int(player['wins'] * 10 + player['win_rate'] * 50)
            self.players.append(player)
        
        # Trier par points
        self.players = sorted(self.players, key=lambda x: x['points'], reverse=True)
        
        # Attribuer les rangs
        for i, player in enumerate(self.players):
            player['rank'] = i + 1
    
    def get_leaderboard(self, limit=10):
        """Retourne le classement"""
        return self.players[:limit]
    
    def get_player_rank(self, player_id):
        """Retourne le rang d'un joueur"""
        for player in self.players:
            if player['id'] == player_id:
                return player['rank']
        return None
    
    def get_top_players_by_game(self, game, limit=5):
        """Retourne les meilleurs joueurs pour un jeu spécifique"""
        game_players = [p for p in self.players if p['favorite_game'] == game]
        return sorted(game_players, key=lambda x: x['points'], reverse=True)[:limit]
    
    def update_player_stats(self, player_id, stats):
        """Met à jour les statistiques d'un joueur"""
        for player in self.players:
            if player['id'] == player_id:
                player['wins'] += stats.get('wins', 0)
                player['losses'] += stats.get('losses', 0)
                player['total_games'] = player['wins'] + player['losses']
                player['win_rate'] = player['wins'] / max(1, player['total_games'])
                player['points'] = int(player['wins'] * 10 + player['win_rate'] * 50)
                break
        
        # Retrier
        self.players = sorted(self.players, key=lambda x: x['points'], reverse=True)
        for i, player in enumerate(self.players):
            player['rank'] = i + 1
        
        return self.get_player_rank(player_id)