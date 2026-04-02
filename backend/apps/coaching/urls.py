from django.urls import path

from .views import get_gym_rules, create_gym_rule,  CoachingSessionBookingView, CoachingSessionDetailView, CoachAvailabilityView, CoachScheduleView

urlpatterns = [
    path('sessions/',                  CoachingSessionBookingView.as_view()),
    path('sessions/<int:session_id>/', CoachingSessionDetailView.as_view()),
    path('availability/',              CoachAvailabilityView.as_view()),
    path('schedule/',                  CoachScheduleView.as_view()),

    path('gym-rules/', get_gym_rules),
    path('gym-rules/create/', create_gym_rule),
]
