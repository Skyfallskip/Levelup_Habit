from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied

@login_required
def dashboard(request):
    if not request.user.is_authenticated:
        raise PermissionDenied
    return render(request, 'home.html')
