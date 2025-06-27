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
    completed = models.BooleanField(default=False)
    streak = models.PositiveIntegerField(default=0)
    last_completed_at = models.DateTimeField(null=True, blank=True)
    
    completions = models.ManyToManyField(
        User,
        through='HabitCompletion',
        related_name='habits_completed',  # ajustado para evitar conflito
        blank=True
    )

    def __str__(self):
        return self.title


class HabitCompletion(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='habit_completions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habit_completion_records')
    completed_at = models.DateTimeField(null=True, blank=True)  # Permite setar manualmente no save
    streak = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('habit', 'user', 'completed_at')

    def __str__(self):
        return f"{self.habit.title} ({self.user.username})"

    def is_completed_today(self):
        today = timezone.now().date()
        return HabitCompletion.objects.filter(
            habit=self.habit,
            user=self.user,
            completed_at__date=today
        ).exists()

    def update_streak(self):
        today = timezone.now().date()
        # Busca a última conclusão antes de hoje
        last_completion = HabitCompletion.objects.filter(
            habit=self.habit,
            user=self.user,
            completed_at__lt=timezone.now()
        ).order_by('-completed_at').first()

        if last_completion:
            last_completion_date = last_completion.completed_at.date()
            if (today - last_completion_date).days == 1:
                self.streak = last_completion.streak + 1
            else:
                self.streak = 1
        else:
            self.streak = 1

    def save(self, *args, **kwargs):
        if not self.completed_at:
            self.completed_at = timezone.now()
        self.update_streak()
        super().save(*args, **kwargs)

    # Métodos auxiliares para acessar dados relacionados (opcional)
    def get_xp_reward(self):
        return self.habit.xp_reward

    def get_frequency(self):
        return self.habit.frequency

    def get_description(self):
        return self.habit.description

    def get_title(self):
        return self.habit.title

    def get_created_at(self):
        return self.habit.created_at

    def get_is_active(self):
        return self.habit.is_active

    def get_xp(self):
        return self.habit.xp

    def get_completed(self):
        return self.habit.completed

    def get_last_completed_at(self):
        return self.habit.last_completed_at

    def get_user_habit_completions(self):
        return self.user.habit_completion_records.filter(habit=self.habit)
