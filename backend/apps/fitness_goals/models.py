from django.db import models

from apps.users.models import Member, Coach

class FitnessGoal(models.Model):
    user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='fitness_goals')
    goal_text = models.CharField(max_length=255)
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.goal_text}"
