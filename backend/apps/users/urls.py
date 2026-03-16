from django.urls import path
from .views import RegisterView, LoginView, CoachListView, CoachingSessionBookingView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('coaches/', CoachListView.as_view()),
    path('coaching-sessions/', CoachingSessionBookingView.as_view()),
]
