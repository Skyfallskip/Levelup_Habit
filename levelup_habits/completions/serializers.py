from rest_framework import serializers
from .models import Completion

class CompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Completion
        fields = '__all__'
        read_only_fields = ['user']

    def validate(self, data):
        user = self.context['request'].user
        habit = data.get('habit')
        date = data.get('date')
        if Completion.objects.filter(user=user, habit=habit, date=date).exists():
            raise serializers.ValidationError("Você já concluiu esse hábito hoje.")
        return data
