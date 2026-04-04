from django.urls import path
from .views import admin_create_user, admin_update_user, admin_list_users,  RegisterView, LoginView, TokenRefreshView, CoachListView
from .views import (
    RegisterView, 
    LoginView, 
    TokenRefreshView, 
    CoachListView, 
    UserRoleUpdateView,
    CoachApprovalView
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('coaches/', CoachListView.as_view()),

    path('admin/users/', admin_list_users),
    path('admin/users/create/', admin_create_user),
    path('admin/users/<int:user_id>/update/', admin_update_user),
]
    
    # SC-31: Update User Role (Admin only)
    path('users/<int:pk>/role/', UserRoleUpdateView.as_view(), name='user-role-update'),
    
    # SC-32: Coach Profile Approval/Rejection (Admin only)
    path('coaches/<int:pk>/approve/', CoachApprovalView.as_view(), name='coach-approval'),
]
