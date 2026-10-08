from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import logging
from datetime import datetime

# Import des services
from models.recommendation_model import RecommendationModel
from models.performance_analyzer import PerformanceAnalyzer
from models.skill_predictor import SkillPredictor
from services.chatbot_service import ChatbotService
from services.leaderboard_service import LeaderboardService
from services.data_service import DataService

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialisation de Flask
app = Flask(__name__)
CORS(app)

# Initialisation des services
data_service = DataService()
data_service.generate_training_data()

recommendation_model = RecommendationModel()
recommendation_model.load_or_train()

performance_analyzer = PerformanceAnalyzer()
skill_predictor = SkillPredictor()
skill_predictor.load_or_train()

chatbot_service = ChatbotService()
leaderboard_service = LeaderboardService()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifie l'état du service IA"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Endpoint pour les recommandations"""
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        recommendations = recommendation_model.get_recommendations(int(user_id))
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'recommendations': recommendations
        })
    except Exception as e:
        logger.error(f"Error in get_recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-performance', methods=['POST'])
def analyze_performance():
    """Endpoint pour l'analyse de performance"""
    try:
        data = request.json
        user_id = data.get('user_id')
        game_stats = data.get('game_stats', {})
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        analysis = performance_analyzer.analyze_performance(int(user_id), game_stats)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
    except Exception as e:
        logger.error(f"Error in analyze_performance: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict-skill', methods=['POST'])
def predict_skill():
    """Endpoint pour la prédiction de niveau"""
    try:
        data = request.json
        stats = data.get('stats', {})
        
        if not stats:
            return jsonify({'error': 'Stats required'}), 400
        
        prediction = skill_predictor.predict(stats)
        
        return jsonify({
            'success': True,
            'prediction': prediction
        })
    except Exception as e:
        logger.error(f"Error in predict_skill: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chatbot', methods=['POST'])
def chat():
    """Endpoint pour le chatbot"""
    try:
        data = request.json
        message = data.get('message', '')
        user_id = data.get('user_id')
        
        if not message:
            return jsonify({'error': 'Message required'}), 400
        
        response = chatbot_service.get_response(message, user_id)
        
        return jsonify({
            'success': True,
            'response': response
        })
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Endpoint pour le classement"""
    try:
        limit = request.args.get('limit', 10, type=int)
        game = request.args.get('game')
        
        if game:
            leaderboard = leaderboard_service.get_top_players_by_game(game, limit)
        else:
            leaderboard = leaderboard_service.get_leaderboard(limit)
        
        return jsonify({
            'success': True,
            'leaderboard': leaderboard,
            'count': len(leaderboard)
        })
    except Exception as e:
        logger.error(f"Error in get_leaderboard: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/player-rank', methods=['GET'])
def get_player_rank():
    """Endpoint pour le rang d'un joueur"""
    try:
        player_id = request.args.get('player_id', type=int)
        
        if not player_id:
            return jsonify({'error': 'Player ID required'}), 400
        
        rank = leaderboard_service.get_player_rank(player_id)
        
        return jsonify({
            'success': True,
            'player_id': player_id,
            'rank': rank
        })
    except Exception as e:
        logger.error(f"Error in get_player_rank: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/update-stats', methods=['POST'])
def update_stats():
    """Endpoint pour mettre à jour les statistiques"""
    try:
        data = request.json
        player_id = data.get('player_id')
        stats = data.get('stats', {})
        
        if not player_id:
            return jsonify({'error': 'Player ID required'}), 400
        
        new_rank = leaderboard_service.update_player_stats(int(player_id), stats)
        
        return jsonify({
            'success': True,
            'player_id': player_id,
            'new_rank': new_rank
        })
    except Exception as e:
        logger.error(f"Error in update_stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Endpoint pour récupérer les cours"""
    try:
        user_id = request.args.get('user_id', type=int)
        
        if user_id:
            courses = data_service.get_course_recommendations(user_id)
        else:
            courses = data_service.load_courses_data()
            if courses is not None:
                courses = courses.to_dict('records')
            else:
                courses = []
        
        return jsonify({
            'success': True,
            'courses': courses,
            'count': len(courses)
        })
    except Exception as e:
        logger.error(f"Error in get_courses: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting IA Module...")
    app.run(debug=True, host='0.0.0.0', port=5000)