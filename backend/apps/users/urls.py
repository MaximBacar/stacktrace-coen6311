from django.urls import path
from .views import admin_create_user, admin_update_user, admin_list_users,  RegisterView, LoginView, TokenRefreshView, CoachListView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('coaches/', CoachListView.as_view()),

    path('admin/users/', admin_list_users),
    path('admin/users/create/', admin_create_user),
    path('admin/users/<int:user_id>/update/', admin_update_user),
]
