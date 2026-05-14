from django.urls import path
from .views import AnnouncementListView, AnnouncementDetailView, NtcAnnouncementView, UniAnnouncementView
from .upload_views import AnnouncementImageUploadView

urlpatterns = [
    path('', AnnouncementListView.as_view()),
    path('<int:pk>/', AnnouncementDetailView.as_view()),
    path('ntc/', NtcAnnouncementView.as_view()),
    path('university/', UniAnnouncementView.as_view()),
    path('<int:pk>/upload-image/', AnnouncementImageUploadView.as_view()),
]