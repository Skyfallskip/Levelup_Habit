from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

FREQUENCY_CHOICES = [
    ('daily', 'Diário'),
    ('weekly', 'Semanal'),
    ('monthly', 'Mensal'),
]

class Habit(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='habits'
    )
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    xp_reward = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    xp = models.PositiveIntegerField(default=10)

    def __str__(self):
        return f"{self.title} ({self.user.username})"


class Completion(models.Model):
        habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
        date = models.DateField(auto_now_add=True)



