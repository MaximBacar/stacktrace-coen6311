from django.db import models

from apps.users.models import Member, Coach


MEAL_TYPES = [
    ('Breakfast', 'Breakfast'),
    ('Lunch',     'Lunch'),
    ('Dinner',    'Dinner'),
    ('Snacks',    'Snacks'),
]


class NutritionPlan(models.Model):
    member           = models.ForeignKey(Member, on_delete=models.CASCADE, null=True, blank=True, related_name='nutrition_plans')
    coach            = models.ForeignKey(Coach,  on_delete=models.CASCADE, null=True, blank=True, related_name='nutrition_plans')
    name             = models.CharField(max_length=200)
    is_active        = models.BooleanField(default=True)
    target_calories  = models.IntegerField(default=0)
    target_protein   = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    target_carbs     = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    target_fat       = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'nutrition_plans'

    def __str__(self):
        return f'{self.member} — {self.name}'


class MealDay(models.Model):
    plan  = models.ForeignKey(NutritionPlan, on_delete=models.CASCADE, related_name='days')
    name  = models.CharField(max_length=100)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'meal_days'
        ordering = ['order']

    def __str__(self):
        return f'{self.plan} — {self.name}'


class Meal(models.Model):
    day       = models.ForeignKey(MealDay, on_delete=models.CASCADE, related_name='meals')
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)
    name      = models.CharField(max_length=200)
    calories  = models.IntegerField(default=0)
    protein   = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    carbs     = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    fat       = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    recipe_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'meals'
        ordering = ['meal_type']

    def __str__(self):
        return self.name


class MealLog(models.Model):
    member    = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='meal_logs')
    meal      = models.CharField(max_length=20, choices=MEAL_TYPES)
    name      = models.CharField(max_length=200)
    calories  = models.IntegerField(default=0)
    protein   = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    carbs     = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    fat       = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'meal_logs'
        ordering = ['logged_at']

    def __str__(self):
        return f'{self.member} — {self.meal} — {self.name}'
