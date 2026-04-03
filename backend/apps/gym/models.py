from django.db import models

from apps.users.models import Administrator


class Gym(models.Model):
    name        = models.CharField(max_length=255)
    address     = models.TextField(blank=True)
    phone       = models.CharField(max_length=30, blank=True)
    email       = models.EmailField(blank=True)
    description = models.TextField(blank=True)
    max_capacity = models.PositiveIntegerField(default=50) 
    current_occupancy = models.PositiveIntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)
    admins      = models.ManyToManyField(Administrator, related_name='gyms', blank=True)

    class Meta:
        db_table = 'gyms'

    def __str__(self):
        return self.name


class PolicyCategory(models.Model):
    gym         = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='policy_categories')
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        db_table        = 'policy_categories'
        ordering        = ['name']
        verbose_name_plural = 'policy categories'

    def __str__(self):
        return f'{self.gym} — {self.name}'


class Policy(models.Model):
    gym        = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='policies')
    category   = models.ForeignKey(PolicyCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='policies')
    title      = models.CharField(max_length=255)
    content    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'policies'
        ordering = ['category__name', 'title']

    def __str__(self):
        return f'{self.gym} — {self.title}'


class CancellationPolicy(Policy):
    class PenaltyType(models.TextChoices):
        FIXED      = 'fixed',      'Fixed fee'
        PERCENTAGE = 'percentage', 'Percentage of session price'
        NONE       = 'none',       'No penalty'

    penalty_type   = models.CharField(max_length=20, choices=PenaltyType.choices, default=PenaltyType.NONE)
    penalty_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    notice_hours   = models.PositiveIntegerField(default=24, help_text='Hours of notice required to avoid penalty')

    class Meta:
        db_table = 'cancellation_policies'

    def __str__(self):
        return f'[Cancellation] {self.title}'