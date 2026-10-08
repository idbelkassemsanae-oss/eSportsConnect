# accounts/tests.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import PlayerProfile

User = get_user_model()

class UserModelTest(TestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_user_creation(self):
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.check_password('testpass123'))
    
    def test_user_str(self):
        self.assertEqual(str(self.user), 'testuser')
    
    def test_get_full_name(self):
        self.assertEqual(self.user.get_full_name(), 'Test User')
    
    def test_is_coach(self):
        self.user.role = 'coach'
        self.user.save()
        self.assertTrue(self.user.is_coach())
    
    def test_is_player(self):
        self.user.role = 'player'
        self.user.save()
        self.assertTrue(self.user.is_player())
    
    def test_player_profile_creation(self):
        profile = PlayerProfile.objects.create(
            user=self.user,
            skill_level='intermediate'
        )
        self.assertEqual(profile.user.username, 'testuser')
        self.assertEqual(profile.skill_level, 'intermediate')
    
    def test_player_profile_win_rate(self):
        profile = PlayerProfile.objects.create(user=self.user)
        profile.total_matches = 10
        profile.wins = 7
        profile.save()
        self.assertEqual(profile.get_win_rate(), 70.0)