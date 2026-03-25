from django.urls import path

from .views import accept_booking, reject_booking,  CoachingSessionBookingView, CoachingSessionDetailView, CoachAvailabilityView, CoachScheduleView

urlpatterns = [
    path('sessions/',                  CoachingSessionBookingView.as_view()),
    path('sessions/<int:session_id>/', CoachingSessionDetailView.as_view()),
    path('availability/',              CoachAvailabilityView.as_view()),
    path('schedule/',                  CoachScheduleView.as_view()),

    path('booking/<int:session_id>/accept/', accept_booking),
    path('booking/<int:session_id>/reject/', reject_booking),
    ]
