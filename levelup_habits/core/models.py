from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=128, unique=True, null=True, default=None)
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    settings.AUTH_USER_MODEL,

    def __str__(self):
        return f"{self.nickname or self.user.username} - Level {self.level} - XP {self.xp}"

    def add_xp(self, amount):
        self.xp += amount
        while self.xp >= 100 * self.level:
            self.xp -= 100 * self.level
            self.level += 1
        self.save()

    @property
    def email(self):
        return self.user.email

    @property
    def password(self):
        return self.user.password

