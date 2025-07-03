from django.db import models
from django.conf import settings
from habits.models import Habit

class Completion(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='completion_records'  # NOME ÚNICO
    )
    habit = models.ForeignKey('habits.Habit', on_delete=models.CASCADE)
    date = models.DateField()
    completed_at = models.DateTimeField(null=True, blank=True)
    streak = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'habit', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} completou {self.habit.title} em {self.date}"
