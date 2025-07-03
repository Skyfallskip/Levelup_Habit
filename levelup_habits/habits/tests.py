from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Habit
from completions.models import Completion
from datetime import date

class HabitTests(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username='testuser', password='12345678')

    def setUp(self):
        self.client.force_login(self.user)
        self.habit_data = {
            'title': 'Ler livros',
            'description': 'Ler 30 minutos',
            'frequency': 'daily',
            'xp_reward': 10,
            'is_active': True,
        }

    def test_create_habit(self):
        url = reverse('habit-list') 
        response = self.client.post(url, self.habit_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Habit.objects.count(), 1)
        self.assertEqual(Habit.objects.get().title, 'Ler livros')

    def test_list_habits(self):
        Habit.objects.create(user=self.user, **self.habit_data)
        url = reverse('habit-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_habit(self):
        habit = Habit.objects.create(user=self.user, **self.habit_data)
        url = reverse('habit-detail', args=[habit.id])
        new_data = self.habit_data.copy()
        new_data['title'] = 'Ler artigos'
        response = self.client.put(url, new_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        habit.refresh_from_db()
        self.assertEqual(habit.title, 'Ler artigos')

    def test_partial_update_habit(self):
        habit = Habit.objects.create(user=self.user, **self.habit_data)
        url = reverse('habit-detail', args=[habit.id])
        response = self.client.patch(url, {'xp_reward': 20}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        habit.refresh_from_db()
        self.assertEqual(habit.xp_reward, 20)

    def test_delete_habit(self):
        habit = Habit.objects.create(user=self.user, **self.habit_data)
        url = reverse('habit-detail', args=[habit.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Habit.objects.count(), 0)

    def test_create_habit_without_auth(self):
        self.client.logout()  # Remove autenticação de sessão
        url = reverse('habit-list')
        response = self.client.post(url, self.habit_data, format='json')
        # O SessionAuthentication retorna 403 para requests sem CSRF, e 403 para não autenticado
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class CompletionTests(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username='testuser', password='12345678')

    def setUp(self):
        self.client.force_login(self.user)
        self.habit = Habit.objects.create(
            user=self.user,
            title='Ler livros',
            frequency='daily',
            xp_reward=10,
            is_active=True
        )

    def test_mark_completion(self):
        url = reverse('completion-list')
        response = self.client.post(url, {
            "habit": self.habit.id,
            "date": date.today().isoformat(),
            "user": self.user.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Completion.objects.count(), 1)
        self.assertEqual(Completion.objects.get().habit, self.habit)

    def test_list_completions(self):
        Completion.objects.create(habit=self.habit, date=date.today(), user=self.user)
        url = reverse('completion-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class AuthTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345678')

    # Removido: testes de JWT/token, pois agora usamos autenticação por sessão
