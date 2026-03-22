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
    biography    = models.TextField()
    specialty    = models.CharField(max_length=100, blank=True)
    rating       = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    price        = models.IntegerField(default=0, help_text='Price per session in dollars')
    tags         = models.JSONField(default=list)
    avatar_url   = models.URLField(blank=True)
    availability = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'coaches'


