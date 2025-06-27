from django.shortcuts import render
from habits.models import Habit

def dashboard_view(request):
    if not request.user.is_authenticated:
        return render(request, 'acess_denied.html', status=403)
    habits = Habit.objects.filter(user=request.user)
    context = {
        'habits': habits,
        'user': request.user,
        'habit_count': habits.count(),
        'habit_completed_count': habits.filter(completed=True).count(),
        'habit_incomplete_count': habits.filter(completed=False).count(),
        'habit_progress': {
            'completed': habits.filter(completed=True).count(),
            'incomplete': habits.filter(completed=False).count(),
        },
        'habit_streak': habits.filter(streak__gt=0).count(),
        'level': getattr(getattr(request.user, 'userprofile', None), 'level', 1),
        'xp': getattr(getattr(request.user, 'userprofile', None), 'xp', 0),
    }
    return render(request, 'home.html', context)

def config_view(request):
    if not request.user.is_authenticated:
        return render(request, 'acess_denied.html', status=403)
    context = {
        'user': request.user,
        'level': getattr(getattr(request.user, 'userprofile', None), 'level', 1),
        'xp': getattr(getattr(request.user, 'userprofile', None), 'xp', 0),
    }
    return render(request, 'config.html', context)