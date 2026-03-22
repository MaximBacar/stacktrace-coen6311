from django.urls import path

from .views import CoachingSessionBookingView, CoachingSessionDetailView

urlpatterns = [
    path('sessions/', CoachingSessionBookingView.as_view()),
    path('sessions/<int:session_id>/', CoachingSessionDetailView.as_view()),
]
