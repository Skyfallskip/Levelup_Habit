from django.shortcuts import render
from django.core.exceptions import PermissionDenied
from habits.models import Habit

def dashboard_view(request):
    if not request.user.is_authenticated:
        raise PermissionDenied("Você não tem permissão para acessar esta página.")
    habits = Habit.objects.filter(user=request.user)
    context = {
        'habits': habits,
        'user': request.user,
        'context' : Habit.description,
        'title': Habit.title,
        'habit_count': habits.count(),
        'habit_completed_count': habits.filter(completed=True).count(),
        'habit_incomplete_count': habits.filter(completed=False).count(),
        'habit_progress': {
            'completed': habits.filter(completed=True).count(),
            'incomplete': habits.filter(completed=False).count(),
        },
        'habit_streak': habits.filter(streak__gt=0).count(),
        'level' : request.user.userprofile.level if hasattr(request.user, 'userprofile') else 1,
        'xp' : request.user.userprofile.xp if hasattr(request.user, 'userprofile') else 0,
    }
    return render(request, 'home.html', context)