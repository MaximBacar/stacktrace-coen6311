from django.urls import path

from .views import get_my_availability, update_my_availability,  CoachingSessionBookingView, CoachingSessionDetailView

urlpatterns = [
    path('sessions/', CoachingSessionBookingView.as_view()),
    path('sessions/<int:session_id>/', CoachingSessionDetailView.as_view()),

path('availability/', get_my_availability),
path('availability/update/', update_my_availability),
]
