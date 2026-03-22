from django.db import models

from apps.users.models import Member

class WorkoutPlan(models.Model):
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="workout_plans"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

class WorkoutDay(models.Model):
    workout_plan = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE, related_name="days")
    day_index = models.IntegerField()
    name = models.CharField(max_length=255)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['day_index']
        unique_together = ('workout_plan', 'day_index')

class WorkoutExercise(models.Model):
    workout_day = models.ForeignKey(
        WorkoutDay,
        on_delete=models.CASCADE,
        related_name='exercises'
    )

    name = models.CharField(max_length=255)
    sets = models.IntegerField()

    reps = models.IntegerField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)

    rest_time = models.IntegerField(help_text="Rest time in seconds")
    order_index = models.IntegerField()

    class Meta:
        ordering = ['order_index']
        unique_together = ('workout_day', 'order_index')

class WorkoutLog(models.Model):
    workout_day = models.ForeignKey(
        WorkoutDay,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    created_at = models.DateTimeField(auto_now_add=True)

class SetLog(models.Model):
    workout_log = models.ForeignKey(
        WorkoutLog,
        on_delete=models.CASCADE,
        related_name='sets'
    )
    exercise = models.ForeignKey(
        WorkoutExercise,
        on_delete=models.CASCADE,
        related_name='logs'
    )

    reps = models.IntegerField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2)



