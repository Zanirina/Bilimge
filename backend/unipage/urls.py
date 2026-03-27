from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import UniversityViewSet

router = DefaultRouter()
router.register(r'', views.UniversityViewSet, basename='university')

urlpatterns = [
    path('', views.unipage, name='main/unipage'),
    path('api/universities/', include(router.urls)),

]