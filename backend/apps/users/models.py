from django.db import models


class User(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    password_hash = models.CharField(max_length=255)
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('coach', 'Coach'),
        ('member', 'Member'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')

    class Meta:
        db_table = 'users'


class Administrator(User):
    class Meta:
        db_table = 'administrators'


class DietaryRestriction(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    class Meta:
        db_table = 'dietary_restrictions'
        ordering = ['name']

    def __str__(self):
        return self.name


class Member(User):
    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female'), ('prefer_not', 'Prefer not to say')]

    dob        = models.DateField()
    height     = models.IntegerField()
    gender     = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, default='')
    avatar_b64 = models.TextField(blank=True, default='')
    dietary_restrictions = models.ManyToManyField(
        DietaryRestriction,
        through='MemberDietaryRestriction',
        related_name='members',
        blank=True,
    )

    class Meta:
        db_table = 'members'


class MemberDietaryRestriction(models.Model):
    member      = models.ForeignKey(Member,             on_delete=models.CASCADE, related_name='member_dietary_restrictions')
    restriction = models.ForeignKey(DietaryRestriction, on_delete=models.CASCADE, related_name='member_restrictions')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table       = 'member_dietary_restrictions'
        unique_together = ('member', 'restriction')


class Coach(User):
    biography    = models.TextField()
    specialty    = models.CharField(max_length=100, blank=True)
    rating       = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    price        = models.IntegerField(default=0, help_text='Price per session in dollars')
    tags         = models.JSONField(default=list)
    avatar_url   = models.URLField(blank=True)
    availability = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=(
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected')
        ),
        default='pending'
    )
    rejection_reason = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    # ----------------------------------

    class Meta:
        db_table = 'coaches'

class RoleChangeLog(models.Model):
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='role_history')
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    old_role = models.CharField(max_length=20)
    new_role = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'role_change_logs'


