from django.db import models

from apps.users.models import Member


ACTIVITY_LEVEL_CHOICES = [
    ('sedentary', 'Sedentary'),
    ('light',     'Lightly active'),
    ('moderate',  'Moderately active'),
    ('very',      'Very active'),
    ('extreme',   'Extremely active'),
]


class FitnessGoal(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    class Meta:
        db_table = 'fitness_goals_catalogue'
        ordering = ['name']

    def __str__(self):
        return self.name


class FitnessProfile(models.Model):
    member         = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='fitness_profile')
    height_cm      = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    weight_kg      = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVEL_CHOICES, blank=True)

    class Meta:
        db_table = 'fitness_profiles'

    def __str__(self):
        return f'Profile({self.member})'


class MemberFitnessGoal(models.Model):
    profile    = models.ForeignKey(FitnessProfile, on_delete=models.CASCADE, related_name='member_goals')
    goal       = models.ForeignKey(FitnessGoal, on_delete=models.CASCADE, related_name='member_goals')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'member_fitness_goals'
        unique_together = ('profile', 'goal')
