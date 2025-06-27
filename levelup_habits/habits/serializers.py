from rest_framework import serializers
from .models import Habit
from completions.models import Completion

class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = ['id', 'title', 'description', 'frequency', 'xp_reward', 'is_active', 'created_at', 'xp']
        read_only_fields = ['id', 'created_at']
        
class CompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Completion
        fields = '__all__'