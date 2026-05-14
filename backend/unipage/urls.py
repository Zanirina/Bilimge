from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import (
    UniversityViewSet,
    MyUniversityView,
    MyUniversityProgramView,
    MyUniversityProgramDetailView,
    MyUniversityUpdateView,
    MyUniversityLanguagesView,
    MyUniversityLanguageDeleteView,
    MyUniversityRequirementsView,
    MyUniversityRequirementDetailView,
    MyUniversityExamsView,
    MyUniversityExamDetailView,
    MyUniversityMobilityView,
    MyUniversityMobilityDetailView,
    NtcUniversityUpdateView,
    MyUniversityApplicantsView,
    LanguageListView,
)
from .upload_views import UniversityLogoUploadView, UniversityCoverUploadView

router = DefaultRouter()
router.register(r'universities', views.UniversityViewSet, basename='university')
router.register(r'fields', views.FieldOfStudyViewSet, basename='field-api')
router.register(r'programs', views.NtcProgramViewSet, basename='program-api')
router.register(r'subjects', views.SubjectViewSet, basename='subject-api')
router.register(r'university-programs', views.UniversityProgramViewSet, basename='university-program')


urlpatterns = [
    path('', views.unipage, name='unipage_view'),

    path('fields/', views.field_list, name='field_list'),
    path('fields/<str:field_code>/programs/', views.ntc_programs_by_field, name='programs_by_field'),
    path('programs/add/<str:field_code>/', views.ntc_program_edit, name='ntc_program_add'),
    path('programs/edit/<str:code>/', views.ntc_program_edit, name='ntc_program_edit'),
    path('programs/delete/<str:code>/', views.ntc_program_delete, name='ntc_program_delete'),

    path('fields/add/', views.field_edit, name='field_add'),
    path('fields/edit/<str:code>/', views.field_edit, name='field_edit'),
    path('fields/delete/<str:code>/', views.field_delete, name='field_delete'),

    # API
    path('api/', include(router.urls)),
    path('api/languages/', LanguageListView.as_view(), name='languages-list'),
    path('api/my-university/', MyUniversityView.as_view(), name='my-university'),
    path('api/my-university/info/', MyUniversityUpdateView.as_view(), name='my-university-info'),
    path('api/my-university/programs/', MyUniversityProgramView.as_view(), name='my-university-programs'),
    path('api/my-university/programs/<str:code>/', MyUniversityProgramDetailView.as_view(), name='my-university-program-detail'),
    path('api/my-university/languages/', MyUniversityLanguagesView.as_view(), name='my-university-languages'),
    path('api/my-university/languages/<int:lang_id>/', MyUniversityLanguageDeleteView.as_view(), name='my-university-language-delete'),
    path('api/my-university/requirements/', MyUniversityRequirementsView.as_view(), name='my-university-requirements'),
    path('api/my-university/requirements/<int:pk>/', MyUniversityRequirementDetailView.as_view(), name='my-university-requirement-detail'),
    path('api/my-university/exams/', MyUniversityExamsView.as_view(), name='my-university-exams'),
    path('api/my-university/exams/<int:pk>/', MyUniversityExamDetailView.as_view(), name='my-university-exam-detail'),
    path('api/my-university/mobility/', MyUniversityMobilityView.as_view(), name='my-university-mobility'),
    path('api/my-university/mobility/<int:pk>/', MyUniversityMobilityDetailView.as_view(), name='my-university-mobility-detail'),
    path('api/my-university/applicants/', MyUniversityApplicantsView.as_view(), name='my-university-applicants'),
    path('api/universities/<str:code>/edit/', NtcUniversityUpdateView.as_view(), name='university-edit'),

    path('api/my-university/upload-logo/', UniversityLogoUploadView.as_view()),
    path('api/my-university/upload-cover/', UniversityCoverUploadView.as_view())

]