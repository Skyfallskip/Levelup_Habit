from django.test import TestCase
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.profile = UserProfile.objects.get(user=self.user)

    def test_profile_created_on_user_creation(self):
        #Testa se o perfil é criado automaticamente ao criar um usuário.
        self.assertIsInstance(self.profile, UserProfile)
        self.assertEqual(self.profile.user, self.user)

    def test_str_method(self):
        #Testa o método __str__ do perfil.
        self.profile.nickname = "Tester"
        self.profile.save()
        self.assertEqual(str(self.profile), "Tester - Level 1 - XP 0")

    def test_add_xp_and_level_up(self):
        #Testa se o XP é adicionado corretamente e o level up funciona.
        self.profile.nickname = "Tester"
        self.profile.save()
        self.profile.add_xp(250)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.level, 2)
        self.assertEqual(self.profile.xp, 150)  # 250 - 100 (level 1) = 150

    def test_unique_nickname(self):
        #Testa se o nickname é único.
        self.profile.nickname = "Tester"
        self.profile.save()
        user2 = User.objects.create_user(username='testuser2', password='12345')
        with self.assertRaises(Exception):
            UserProfile.objects.create(user=user2, nickname="Tester")