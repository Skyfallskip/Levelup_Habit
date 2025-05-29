# completions/views.py

from rest_framework import viewsets, permissions
from .models import Completion
from .serializers import CompletionSerializer
from django.contrib.auth.models import User
from habits.models import Habit
from core.models import UserProfile

class CompletionViewSet(viewsets.ModelViewSet):
    serializer_class = CompletionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Completion.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        completion = serializer.save(user=self.request.user)
        habit = completion.habit

        # Atualiza XP do usuário
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        profile.add_xp(habit.xp)
