from django.urls import path
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
    
    # SC-31: Update User Role (Admin only)
    path('users/<int:pk>/role/', UserRoleUpdateView.as_view(), name='user-role-update'),
    
    # SC-32: Coach Profile Approval/Rejection (Admin only)
    path('coaches/<int:pk>/approve/', CoachApprovalView.as_view(), name='coach-approval'),
]