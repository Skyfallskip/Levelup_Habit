from django.test import TestCase
from django.contrib.auth.models import User
from .models import UserProfile
from django.db import IntegrityError

class UserProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.profile = UserProfile.objects.get(user=self.user)

    def test_profile_created_on_user_creation(self):
        """Verifica se o perfil é criado automaticamente ao criar um usuário."""
        self.assertIsInstance(self.profile, UserProfile)
        self.assertEqual(self.profile.user, self.user)

    def test_str_method(self):
        """Verifica a representação em string do perfil."""
        self.profile.nickname = "Tester"
        self.profile.save()
        self.assertEqual(str(self.profile), "Tester - Level 1 - XP 0")

    def test_add_xp_and_level_up(self):
        """Testa a adição de XP e o aumento de nível corretamente."""
        self.profile.nickname = "Tester"
        self.profile.save()

        self.profile.add_xp(250)
        self.profile.refresh_from_db()

        self.assertEqual(self.profile.level, 2)
        self.assertEqual(self.profile.xp, 150)  # 250 XP - 100 (para upar do lvl 1) = 150 restantes

    def test_unique_nickname(self):
        """Garante que o nickname seja único entre perfis."""
        self.profile.nickname = "Tester"
        self.profile.save()

        user2 = User.objects.create_user(username='testuser2', password='12345')

        with self.assertRaises(IntegrityError):
            UserProfile.objects.create(user=user2, nickname="Tester")
