from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompletionViewSet
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

router = DefaultRouter()
router.register(r'completions', CompletionViewSet, basename='completion')

urlpatterns = [
    path('', include(router.urls)),
]

schema_view = get_schema_view(
   openapi.Info(
      title="LevelUp Habit API",
      default_version='v1',
      description="Documentação interativa da API de hábitos com gamificação",
      contact=openapi.Contact(email="contato.mateuslirio@gmail.com"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

urlpatterns += [
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]