from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HabitViewSet,CompletionViewSet



router = DefaultRouter()
router.register(r'', HabitViewSet, basename='habit')

urlpatterns = [
    path('', include(router.urls)),
]
