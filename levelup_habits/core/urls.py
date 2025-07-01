from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('config/', views.config_view, name='config'),
    path('perfil/', views.perfil_view, name='perfil'),
]
