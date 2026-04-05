from django.urls import path

from .views import (
    CoachingSessionBookingView,
    CoachingSessionDetailView,
    CoachAvailabilityView,
    CoachScheduleView,
    AssignedMembersView,
    SessionEquipmentReservationView,
)

urlpatterns = [
    path('sessions/',                  CoachingSessionBookingView.as_view()),
    path('sessions/<int:session_id>/', CoachingSessionDetailView.as_view()),
    path('availability/',              CoachAvailabilityView.as_view()),
    path('schedule/',                  CoachScheduleView.as_view()),
    path('clients/',                   AssignedMembersView.as_view()),
    path('sessions/<int:session_id>/equipment-reservations/', SessionEquipmentReservationView.as_view()),
]
