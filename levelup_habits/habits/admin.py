from django.contrib import admin
from .models import Habit, Completion

@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'frequency', 'xp_reward', 'is_active', 'created_at')
    list_filter = ('frequency', 'is_active', 'created_at')
    search_fields = ('title', 'description', 'user__username')
    ordering = ('-created_at',)

@admin.register(Completion)
class CompletionAdmin(admin.ModelAdmin):
    list_display = ('habit', 'date')
    list_filter = ('date',)
    search_fields = ('habit__title',)
