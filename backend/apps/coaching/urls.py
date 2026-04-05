from django.urls import path

from .views import get_cancellation_rules, cancel_session,  (
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
    path('clients/',                   AssignedMembersView.as_view()),

path('cancellation-rules/', get_cancellation_rules),
path('sessions/<int:session_id>/cancel/', cancel_session),
]
