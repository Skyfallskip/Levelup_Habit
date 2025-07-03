from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.utils import timezone
from habits.models import count_pending_habits, count_completed_habits, Habit
from completions.models import Completion
from .models import UserProfile

def dashboard_view(request):
    if not request.user.is_authenticated:
        return render(request, 'acess_denied.html', status=403)
    habits = Habit.objects.filter(user=request.user)
    today = timezone.now().date()
    completed_ids = set(
        Completion.objects.filter(user=request.user, date=today)
        .values_list('habit_id', flat=True)
    )
    pending_habits_count = habits.exclude(id__in=completed_ids).count()
    completed_habits_count = len(completed_ids)
    context = {
        'habits': habits,
        'user': request.user,
        'habit_count': habits.count(),
        "completed_habits_count": completed_habits_count,
        "pending_habits_count": pending_habits_count,
        'habit_streak': habits.filter(streak__gt=0).count(),
        'level': getattr(getattr(request.user, 'userprofile', None), 'level', 1),
        'xp': getattr(getattr(request.user, 'userprofile', None), 'xp', 0),
        'profile': getattr(request.user, 'userprofile', None),
        'completed_habits_ids': completed_ids,
        'habit_progress': {
            'completed': habits.filter(id__in=completed_ids).count(),
            'incomplete': habits.exclude(id__in=completed_ids).count(),
        },
    }
    return render(request, 'home.html', context)

def config_view(request):
    if not request.user.is_authenticated:
        return render(request, 'acess_denied.html', status=403)
    context = {
        'user': request.user,
        'level': getattr(getattr(request.user, 'userprofile', None), 'level', 1),
        'xp': getattr(getattr(request.user, 'userprofile', None), 'xp', 0),
        'profile': getattr(request.user, 'userprofile', None),
    }
    return render(request, 'config.html', context)

def perfil_view(request):
    if not request.user.is_authenticated:
        return render(request, 'acess_denied.html', status=403)
    profile = request.user.userprofile
    context = {
        'user': request.user,
        'profile': profile,
        'level': profile.level,
        'xp': profile.xp,
        'date_joined': request.user.date_joined,
        'last_login': request.user.last_login,
    }
    return render(request, 'perfil.html', context)

@login_required
def edit_user(request):
    user = request.user
    profile = user.userprofile  # <-- Corrigido aqui
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        print(request.FILES)  # Veja se aparece algo no terminal
        profile_picture = request.FILES.get('profile_picture')
        print(profile_picture)

        user.username = username
        user.email = email
        user.save()

        if profile_picture:
            profile.profile_picture = profile_picture
        profile.save()

        return redirect('/perfil/')

    return render(request, 'perfil.html', {'user': user, 'profile': profile})