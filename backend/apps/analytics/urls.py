from django.urls import path
from .views import PeakHoursView

urlpatterns = [
    path('peak-hours/', PeakHoursView.as_view(), name='peak_hours'),
]
