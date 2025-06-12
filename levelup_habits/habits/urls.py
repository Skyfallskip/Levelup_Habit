from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HabitViewSet,CompletionViewSet


router = DefaultRouter()
router.register(r'', HabitViewSet, basename='habit')
router.register(r'completions', CompletionViewSet, basename='completion')

urlpatterns = router.urls

urlpatterns = [
    path('', include(router.urls)),
]
