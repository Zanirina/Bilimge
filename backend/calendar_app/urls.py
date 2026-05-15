from django.urls import path
from .views import (
    CalendarEventListView,
    UniversityCalendarView,
    NtcCalendarView,
    NtcCalendarDetailView,
    UniCalendarView,
    UniCalendarDetailView,
    PersonalCalendarView,
    PersonalCalendarDetailView,
)

urlpatterns = [
    # Публичный календарь
    path('', CalendarEventListView.as_view()),
    path('university/<str:code>/', UniversityCalendarView.as_view()),

    # NTC
    path('ntc/', NtcCalendarView.as_view()),
    path('ntc/<int:pk>/', NtcCalendarDetailView.as_view()),

    # Uni Admin
    path('my-university/', UniCalendarView.as_view()),
    path('my-university/<int:pk>/', UniCalendarDetailView.as_view()),

    # Личные события
    path('personal/', PersonalCalendarView.as_view()),
    path('personal/<int:pk>/', PersonalCalendarDetailView.as_view()),
]