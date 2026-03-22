from django.contrib import admin
from .models import WorkoutPlan, WorkoutDay, WorkoutExercise

admin.site.register(WorkoutPlan)
admin.site.register(WorkoutDay)
admin.site.register(WorkoutExercise)
