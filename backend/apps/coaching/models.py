from django.db import models

from apps.gym.models import Equipment
from apps.users.models import Member, Coach


class CoachingSession(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='coaching_sessions')
    coach = models.ForeignKey(Coach, on_delete=models.CASCADE, related_name='booked_sessions')
    scheduled_slot = models.CharField(max_length=120)
    duration       = models.IntegerField(default=60, help_text='Duration in minutes')
    goals          = models.TextField(blank=True)
    status         = models.CharField(max_length=20, default='booked')
    rejection_reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'coaching_sessions'


class ProfileAccessRequest(models.Model):
    class Status(models.TextChoices):
        PENDING  = 'pending',  'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'

    coach      = models.ForeignKey(Coach,  on_delete=models.CASCADE, related_name='access_requests_sent')
    member     = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='access_requests_received')
    status     = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table        = 'profile_access_requests'
        unique_together = ('coach', 'member')

    def __str__(self):
        return f'{self.coach} → {self.member} ({self.status})'


class EquipmentReservation(models.Model):
    class Status(models.TextChoices):
        RESERVED = 'reserved', 'Reserved'
        RELEASED = 'released', 'Released'

    session = models.ForeignKey(CoachingSession, on_delete=models.CASCADE, related_name='equipment_reservations')
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='session_reservations')
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.RESERVED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'equipment_reservations'
