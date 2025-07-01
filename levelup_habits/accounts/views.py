from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.shortcuts import render, redirect, get_object_or_404
import re


# View de registro de usuário
@transaction.atomic
def register_view(request):
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')
        error = None

        if not all([username, email, password, confirm_password]):
            error = 'Todos os campos são obrigatórios.'
        elif len(username) < 3:
            error = 'Nome de usuário deve ter pelo menos 3 caracteres.'
        elif not re.match(r'^[a-zA-Z0-9_]+$', username):
            error = 'Nome de usuário deve conter apenas letras, números e underscores.'
        elif User.objects.filter(username=username).exists():
            error = 'Nome de usuário já existe.'
        elif User.objects.filter(email=email).exists():
            error = 'Email já está em uso.'
        elif password != confirm_password:
            error = 'As senhas não coincidem.'
        elif len(password) < 8:
            error = 'Senha deve ter pelo menos 8 caracteres.'
        else:
            try:
                validate_email(email)
            except ValidationError:
                error = 'Email inválido.'

        if error:
            return render(request, 'register.html', {'error': error, 'username': username, 'email': email})

        user = User.objects.create_user(username=username, email=email, password=password)
        login(request, user)
        return redirect('dashboard')

    return render(request, 'register.html')


# View de login
def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    error = None
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            error = 'Credenciais inválidas.'
    return render(request, 'login.html', {'error': error})


# View de logout
@login_required
def logout_view(request):
    logout(request)
    return redirect('login')


# Dashboard protegido
@login_required
def dashboard(request):
    return render(request, 'home.html', {'user': request.user})


# Edição de usuário
@login_required
def edit_user_view(request, pk=None):
    if pk and request.user.is_staff:
        user = get_object_or_404(User, pk=pk)
    else:
        user = request.user

    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        error = None
        try:
            if username and username != user.username:
                if User.objects.filter(username=username).exclude(pk=user.pk).exists():
                    error = 'Nome de usuário já existe.'
                else:
                    user.username = username
            if email and email != user.email:
                validate_email(email)
                if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                    error = 'Email já está em uso.'
                else:
                    user.email = email
            if not error:
                user.save()
                return redirect('dashboard')
        except ValidationError:
            error = 'Email inválido.'
        except Exception:
            error = 'Erro ao atualizar dados.'
        return render(request, 'edit_user.html', {'user': user, 'error': error})
    return render(request, 'edit_user.html', {'user': user})


# Deleção de usuário
@login_required
def delete_user_view(request):
    if request.method == 'POST':
        user = request.user
        logout(request)
        user.delete()
        return redirect('login')
    return render(request, 'delete_user.html')