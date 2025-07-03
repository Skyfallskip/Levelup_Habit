from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone

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
    streak = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title


def count_pending_habits(user):
    from django.utils import timezone
    from completions.models import Completion
    today = timezone.now().date()
    habits = Habit.objects.filter(user=user, is_active=True)
    completed_ids = set(
        Completion.objects.filter(user=user, date=today)
        .values_list('habit_id', flat=True)
    )
    pending_habits_count = habits.exclude(id__in=completed_ids).count()
    completed_habits_count = len(completed_ids)
    return pending_habits_count

def count_completed_habits(user):
    from django.utils import timezone
    from completions.models import Completion
    today = timezone.now().date()
    habits = Habit.objects.filter(user=user, is_active=True)
    concluidos = 0
    for habit in habits:
        completed_today = Completion.objects.filter(
            habit=habit,
            user=user,
            completed_at__date=today
        ).exists()
        if completed_today:
            concluidos += 1
    return concluidos
