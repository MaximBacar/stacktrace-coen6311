from django.urls import path

from .views import (
    PolicyCategoryListView, PolicyCategoryDetailView,
    PolicyListView, PolicyDetailView,
    CancellationPolicyListView, CancellationPolicyDetailView,
)

urlpatterns = [
    # Policy categories
    path('<int:gym_id>/policy-categories/',                PolicyCategoryListView.as_view()),
    path('<int:gym_id>/policy-categories/<int:category_id>/', PolicyCategoryDetailView.as_view()),

    # Policies
    path('<int:gym_id>/policies/',                         PolicyListView.as_view()),
    path('<int:gym_id>/policies/<int:policy_id>/',         PolicyDetailView.as_view()),

    # Cancellation policies
    path('<int:gym_id>/cancellation-policies/',            CancellationPolicyListView.as_view()),
    path('<int:gym_id>/cancellation-policies/<int:policy_id>/', CancellationPolicyDetailView.as_view()),
]
