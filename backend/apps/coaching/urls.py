from django.urls import path

from .views import get_assigned_members_profiles,  CoachingSessionBookingView, CoachingSessionDetailView, CoachAvailabilityView, CoachScheduleView

urlpatterns = [
    path('sessions/',                  CoachingSessionBookingView.as_view()),
    path('sessions/<int:session_id>/', CoachingSessionDetailView.as_view()),
    path('availability/',              CoachAvailabilityView.as_view()),
    path('schedule/',                  CoachScheduleView.as_view()),
    path('assigned-members/profiles/', get_assigned_members_profiles),
]
