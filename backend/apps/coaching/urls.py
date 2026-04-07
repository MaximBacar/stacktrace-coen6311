from django.urls import path

from .views import (
    CoachingSessionBookingView,
    CoachingSessionDetailView,
    CoachingSessionRequestsView,
    CoachingSessionRespondView,
    CoachAvailabilityView,
    CoachScheduleView,
    AssignedMembersView,
    ClientDetailView,
    ProfileAccessRequestView,
    ProfileAccessRequestDetailView,
    SessionEquipmentReservationView,
    AdminEquipmentReservationTrackingView,
)

urlpatterns = [
    path('sessions/',                             CoachingSessionBookingView.as_view()),
    path('sessions/<int:session_id>/',            CoachingSessionDetailView.as_view()),
    path('sessions/<int:session_id>/respond/',    CoachingSessionRespondView.as_view()),
    path('requests/',                             CoachingSessionRequestsView.as_view()),
    path('availability/',              CoachAvailabilityView.as_view()),
    path('schedule/',                  CoachScheduleView.as_view()),
    path('clients/',                              AssignedMembersView.as_view()),
    path('clients/<int:member_id>/',              ClientDetailView.as_view()),
    path('access-requests/',                      ProfileAccessRequestView.as_view()),
    path('access-requests/<int:request_id>/',     ProfileAccessRequestDetailView.as_view()),
    path('sessions/<int:session_id>/equipment-reservations/', SessionEquipmentReservationView.as_view()),
    path('equipment-reservations/',    AdminEquipmentReservationTrackingView.as_view()),
]
