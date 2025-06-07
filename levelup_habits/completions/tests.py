from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Habit
from completions.models import Completion
from datetime import date, timedelta

class CompletionTests(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username='testuser', password='12345678')

    def setUp(self):
        # Obtem token JWT
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser',
            'password': '12345678'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        # Cria um hábito pra usar nos testes
        self.habit = Habit.objects.create(
            user=self.user,
            title='Ler livros',
            frequency='daily',
            xp_reward=10,
            is_active=True
        )

        # Dados padrão para criação
        self.completion_data = {
            "habit": self.habit.id,
            "date": date.today().isoformat(),
            "user": self.user.id  # pode ou não ser necessário dependendo do serializer
        }

    def test_create_completion(self):
        url = reverse('completion-list')
        response = self.client.post(url, self.completion_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Completion.objects.count(), 1)
        self.assertEqual(Completion.objects.get().habit, self.habit)

    def test_list_completions(self):
        Completion.objects.create(habit=self.habit, date=date.today(), user=self.user)
        url = reverse('completion-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_completion_detail(self):
        completion = Completion.objects.create(habit=self.habit, date=date.today(), user=self.user)
        url = reverse('completion-detail', args=[completion.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], completion.id)

    def test_partial_update_completion(self):
        completion = Completion.objects.create(habit=self.habit, date=date.today(), user=self.user)
        url = reverse('completion-detail', args=[completion.id])
        new_date = (date.today() - timedelta(days=1)).isoformat()
        response = self.client.patch(url, {'date': new_date}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        completion.refresh_from_db()
        self.assertEqual(completion.date.isoformat(), new_date)

    def test_delete_completion(self):
        completion = Completion.objects.create(habit=self.habit, date=date.today(), user=self.user)
        url = reverse('completion-detail', args=[completion.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Completion.objects.count(), 0)

    def test_create_completion_without_auth(self):
        self.client.credentials()  
        url = reverse('completion-list')
        response = self.client.post(url, self.completion_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_completion_without_auth(self):
        data = {'habit': self.habit.id}
        response = self.client.post('/completions/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

