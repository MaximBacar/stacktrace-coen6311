from django.urls import path

from .views import (
    GymListView,
    GymCapacityView,
    PolicyCategoryListView, PolicyCategoryDetailView,
    PolicyListView, PolicyDetailView,
    CancellationPolicyListView, CancellationPolicyDetailView,
    EquipmentAvailabilityListView,
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
]
