from django.urls import path
from .views import register_view, login_view, logout_view, delete_user_view, edit_user_view

urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout_view'),
    path('edit/', edit_user_view, name='edit_user'),
    path('delete/', delete_user_view, name='delete_user'),
]
