from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, logout_view

urlpatterns = [
    path('signup/', RegisterView.as_view(), name='api-register'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logar/', LoginView.as_view(), name='api-login'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_view, name='logout_view'),


]
