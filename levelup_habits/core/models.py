# core/models.py (crie app core se não tiver)

from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.user.username} - Level {self.level} - XP {self.xp}"

    def add_xp(self, amount):
        self.xp += amount
        while self.xp >= 100 * self.level:
            self.xp -= 100 * self.level
            self.level += 1
        self.save()
