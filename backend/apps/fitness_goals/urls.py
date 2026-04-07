from django.urls import path

from .views import FitnessGoalsListView, FitnessProfileView

urlpatterns = [
    path('',       FitnessProfileView.as_view()),
    path('goals/', FitnessGoalsListView.as_view()),
]
