from django.urls import path
from .views import peak_hours_view

urlpatterns = [
    path('dashboard/', peak_hours_view, name='peak_hours_dashboard'),
]