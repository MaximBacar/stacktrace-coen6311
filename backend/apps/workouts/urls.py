from django.urls import path
from .views import (
    WorkoutPlanView,
    WorkoutPlanDetailView,
    WorkoutDayView,
    WorkoutDayDetailView,
    WorkoutExerciseView,
    WorkoutExerciseDetailView,
    WorkoutLogView,
    WorkoutLogsListView,
)

urlpatterns = [
    path('',                                                          WorkoutPlanView.as_view()),
    path('logs/',                                                     WorkoutLogsListView.as_view()),
    path('<int:plan_id>/',                                            WorkoutPlanDetailView.as_view()),
    path('<int:plan_id>/days/',                                       WorkoutDayView.as_view()),
    path('<int:plan_id>/days/<int:day_id>/',                          WorkoutDayDetailView.as_view()),
    path('<int:plan_id>/days/<int:day_id>/exercises/',                WorkoutExerciseView.as_view()),
    path('<int:plan_id>/days/<int:day_id>/exercises/<int:exercise_id>/', WorkoutExerciseDetailView.as_view()),
    path('<int:plan_id>/days/<int:day_id>/logs/',                     WorkoutLogView.as_view()),
]
