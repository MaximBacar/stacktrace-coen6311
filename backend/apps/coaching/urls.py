from django.urls import path

from .views import get_gym_capacity, update_gym_capacity,  CoachingSessionBookingView, CoachingSessionDetailView, CoachAvailabilityView, CoachScheduleView
from .views import (
    CoachingSessionBookingView,
    CoachingSessionDetailView,
    CoachAvailabilityView,
    CoachScheduleView,
    AssignedMembersView,
)

urlpatterns = [
    path('sessions/',                  CoachingSessionBookingView.as_view()),
    path('sessions/<int:session_id>/', CoachingSessionDetailView.as_view()),
    path('availability/',              CoachAvailabilityView.as_view()),
    path('schedule/',                  CoachScheduleView.as_view()),
    path('gym-capacity/', get_gym_capacity),
    path('gym-capacity/update/', update_gym_capacity),
    path('clients/',                   AssignedMembersView.as_view()),
]
