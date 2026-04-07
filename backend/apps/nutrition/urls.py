from django.urls import path

from .views import (
    NutritionPlanView,
    NutritionPlansView, NutritionPlanDetailView, NutritionPlanActivateView,
    MealDayView, MealDayDetailView,
    MealItemView, MealItemDetailView,
    MealLogView, MealLogDetailView,
    RecipeListView, RecipeGenerateView,
)

urlpatterns = [
    # Active plan (Today tab)
    path('plan/',                                                               NutritionPlanView.as_view()),

    # Plans CRUD
    path('plans/',                                                              NutritionPlansView.as_view()),
    path('plans/<int:plan_id>/',                                                NutritionPlanDetailView.as_view()),
    path('plans/<int:plan_id>/activate/',                                       NutritionPlanActivateView.as_view()),

    # Days CRUD
    path('plans/<int:plan_id>/days/',                                           MealDayView.as_view()),
    path('plans/<int:plan_id>/days/<int:day_id>/',                              MealDayDetailView.as_view()),

    # Meals CRUD
    path('plans/<int:plan_id>/days/<int:day_id>/meals/',                        MealItemView.as_view()),
    path('plans/<int:plan_id>/days/<int:day_id>/meals/<int:meal_id>/',          MealItemDetailView.as_view()),

    # Meal log
    path('logs/',                                                               MealLogView.as_view()),
    path('logs/<int:log_id>/',                                                  MealLogDetailView.as_view()),

    # Recipes
    path('recipes/',                                                            RecipeListView.as_view()),
    path('recipes/generate/',                                                   RecipeGenerateView.as_view()),
]
