from django.urls import path
from .views import RegisterView, LoginView, TokenRefreshView, CoachListView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('coaches/', CoachListView.as_view()),
]
