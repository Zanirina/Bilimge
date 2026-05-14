from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView, ApplicantProfileView, FavoriteView, FavoriteDeleteView
from .reset_views import PasswordResetRequestView, PasswordResetConfirmView
from .upload_views import AvatarUploadView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('applicant/profile/', ApplicantProfileView.as_view(), name='applicant-profile'),
    path('favorites/', FavoriteView.as_view(), name='favorites'),
    path('favorites/<int:pk>/', FavoriteDeleteView.as_view(), name='favorite-delete'),


    path('reset-password/', PasswordResetRequestView.as_view()),
    path('reset-password/confirm/', PasswordResetConfirmView.as_view()),
    path('upload-avatar/', AvatarUploadView.as_view()),

]