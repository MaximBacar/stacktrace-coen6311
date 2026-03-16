from django.db import models


class User(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    password_hash = models.CharField(max_length=255)

    class Meta:
        db_table = 'users'


class Administrator(User):
    class Meta:
        db_table = 'administrators'


class Member(User):
    dob = models.DateField()
    height = models.IntegerField()

    class Meta:
        db_table = 'members'


class Coach(User):
    biography = models.TextField()
    availability = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'coaches'


class CoachingSession(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='coaching_sessions')
    coach = models.ForeignKey(Coach, on_delete=models.CASCADE, related_name='booked_sessions')
    scheduled_slot = models.CharField(max_length=120)
    goals = models.TextField()
    status = models.CharField(max_length=20, default='booked')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'coaching_sessions'
