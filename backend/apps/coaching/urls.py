from django.urls import path

from .views import admin_report, export_report_csv,  (
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

path('admin/report/',admin_report),
path('admin/report/export/',export_report_csv),
]
