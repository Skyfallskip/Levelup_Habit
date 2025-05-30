from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=128, unique=True,null = True, default='Null')
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.nickname} - Level {self.level} - XP {self.xp}"

    def add_xp(self, amount):
        self.xp += amount
        while self.xp >= 100 * self.level:
            self.xp -= 100 * self.level
            self.level += 1
        self.save()

