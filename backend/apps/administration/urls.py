from django.urls import path

from .views import (
    UserRoleUpdateView,
    AdminUserListView,
    AdminUserDetailView,
    CoachApprovalView,
)

urlpatterns = [
    path('users/',                        AdminUserListView.as_view(),   name='admin-user-list'),
    path('users/<int:user_id>/',          AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:pk>/role/',          UserRoleUpdateView.as_view(),  name='user-role-update'),
    path('coaches/<int:pk>/approve/',     CoachApprovalView.as_view(),   name='coach-approval'),
]