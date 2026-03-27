from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import UniversityViewSet

router = DefaultRouter()
router.register(r'', views.UniversityViewSet, basename='university')

urlpatterns = [
    path('', views.unipage, name='unipage_view'),
    path('api/universities/', include(router.urls)),

    path('fields/', views.field_list, name='field_list'),
    path('fields/<str:field_code>/programs/', views.ntc_programs_by_field, name='programs_by_field'),
    path('programs/add/<str:field_code>/', views.ntc_program_edit, name='ntc_program_add'),
    path('programs/edit/<str:code>/', views.ntc_program_edit, name='ntc_program_edit'),
    path('programs/delete/<str:code>/', views.ntc_program_delete, name='ntc_program_delete'),

    path('fields/add/', views.field_edit, name='field_add'),
    path('fields/edit/<str:code>/', views.field_edit, name='field_edit'),
    path('fields/delete/<str:code>/', views.field_delete, name='field_delete'),
]