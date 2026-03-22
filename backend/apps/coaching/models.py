from django.db import models

from apps.users.models import Member, Coach


class CoachingSession(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='coaching_sessions')
    coach = models.ForeignKey(Coach, on_delete=models.CASCADE, related_name='booked_sessions')
    scheduled_slot = models.CharField(max_length=120)
    goals = models.TextField()
    status = models.CharField(max_length=20, default='booked')
    rejection_reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'coaching_sessions'
