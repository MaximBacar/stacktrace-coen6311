from django.urls import path

from .views import (
    GymListView,
    GymCapacityView,
    PolicyCategoryListView, PolicyCategoryDetailView,
    PolicyListView, PolicyDetailView,
    CancellationPolicyListView, CancellationPolicyDetailView,
    EquipmentAvailabilityListView,
    EquipmentIssueReportListView,
    EquipmentIssueAdminListView,
    EquipmentIssueAdminDetailView,
    EquipmentAdminListView,
    EquipmentAdminDetailView,
)

urlpatterns = [
    # Gyms
    path('',                                                   GymListView.as_view()),

    # Policy categories
    path('<int:gym_id>/policy-categories/',                PolicyCategoryListView.as_view()),
    path('<int:gym_id>/policy-categories/<int:category_id>/', PolicyCategoryDetailView.as_view()),

    # Policies
    path('<int:gym_id>/policies/',                         PolicyListView.as_view()),
    path('<int:gym_id>/policies/<int:policy_id>/',         PolicyDetailView.as_view()),

    # Cancellation policies
    path('<int:gym_id>/cancellation-policies/', CancellationPolicyListView.as_view(), name='cancellation-policy-list'),
    path('<int:gym_id>/cancellation-policies/<int:policy_id>/', CancellationPolicyDetailView.as_view(), name='cancellation-policy-detail'),
    path('<int:gym_id>/capacity/', GymCapacityView.as_view(), name='gym-capacity'),
    path('<int:gym_id>/equipment/', EquipmentAvailabilityListView.as_view(), name='gym-equipment-list'),
    path('equipment/<int:equipment_id>/issues/', EquipmentIssueReportListView.as_view(), name='equipment-issue-report-list'),
    path('equipment-issues/', EquipmentIssueAdminListView.as_view(), name='equipment-issue-admin-list'),
    path('equipment-issues/<int:issue_id>/', EquipmentIssueAdminDetailView.as_view(), name='equipment-issue-admin-detail'),
    path('equipment/', EquipmentAdminListView.as_view(), name='equipment-admin-list'),
    path('equipment/<int:equipment_id>/', EquipmentAdminDetailView.as_view(), name='equipment-admin-detail'),
]
