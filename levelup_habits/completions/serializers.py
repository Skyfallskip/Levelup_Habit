from rest_framework import serializers
from .models import Completion

class CompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Completion
        fields = '__all__'
        read_only_fields = ['user']
