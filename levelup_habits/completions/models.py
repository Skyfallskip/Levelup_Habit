from django.db import models
from django.conf import settings
from habits.models import Habit

class Completion(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='completions'
    )
    habit = models.ForeignKey(
        Habit,
        on_delete=models.CASCADE,
        related_name='completions'
    )
    date = models.DateField()

    class Meta:
        unique_together = ('user', 'habit', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} completou {self.habit.title} em {self.date}"
