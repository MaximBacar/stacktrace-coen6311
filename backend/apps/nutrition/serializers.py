from rest_framework import serializers

from .models import NutritionPlan, MealDay, Meal, MealLog, Recipe


class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Meal
        fields = ['id', 'meal_type', 'name', 'calories', 'protein', 'carbs', 'fat', 'recipe_id']


class MealDaySerializer(serializers.ModelSerializer):
    meals = MealSerializer(many=True, read_only=True)

    class Meta:
        model  = MealDay
        fields = ['id', 'name', 'order', 'meals']


class NutritionPlanReadSerializer(serializers.ModelSerializer):
    days           = MealDaySerializer(many=True, read_only=True)
    created_by     = serializers.SerializerMethodField()
    source_plan_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model  = NutritionPlan
        fields = [
            'id', 'name', 'is_active',
            'target_calories', 'target_protein', 'target_carbs', 'target_fat',
            'created_at', 'days', 'created_by', 'source_plan_id',
        ]

    def get_created_by(self, obj):
        if obj.coach_id:
            return {
                'type':       'coach',
                'name':       f'{obj.coach.first_name} {obj.coach.last_name}'.strip(),
                'avatar_url': obj.coach.avatar_url or '',
            }
        return {'type': 'self'}


class CreateNutritionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model  = NutritionPlan
        fields = ['id', 'name', 'target_calories', 'target_protein', 'target_carbs', 'target_fat']


class CreateMealDaySerializer(serializers.ModelSerializer):
    class Meta:
        model  = MealDay
        fields = ['id', 'name', 'order']


# Keep the old NutritionPlanSerializer for admin use (used in admin views)
class NutritionPlanSerializer(serializers.ModelSerializer):
    days = MealDaySerializer(many=True, read_only=True)

    class Meta:
        model  = NutritionPlan
        fields = [
            'id', 'name', 'is_active',
            'target_calories', 'target_protein', 'target_carbs', 'target_fat',
            'created_at', 'days',
        ]


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Recipe
        fields = [
            'id', 'name', 'description', 'ingredients', 'steps',
            'dietary_restrictions', 'calories', 'protein', 'carbs', 'fat',
            'prep_time', 'tags', 'prompt', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class MealLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MealLog
        fields = ['id', 'meal', 'name', 'calories', 'protein', 'carbs', 'fat', 'logged_at']
        read_only_fields = ['id', 'logged_at']
