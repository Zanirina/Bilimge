from django.urls import path
from .views import CalculatorView, ProgramsBySubjectsView

urlpatterns = [
    path('chances/', CalculatorView.as_view()),
    path('programs/', ProgramsBySubjectsView.as_view()),
]