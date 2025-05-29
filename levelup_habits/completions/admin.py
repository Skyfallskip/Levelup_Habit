from django.contrib import admin
from .models import Completion

@admin.register(Completion)
class CompletionAdmin(admin.ModelAdmin):
    list_display = ('user', 'habit', 'date')
    list_filter = ('date',)
    search_fields = ('user__username', 'habit__title')
