from rest_framework import serializers

from .models import FitnessGoal, FitnessProfile


class FitnessGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FitnessGoal
        fields = ['id', 'name', 'slug']


class FitnessProfileSerializer(serializers.ModelSerializer):
    fitness_goals        = serializers.SerializerMethodField()
    dietary_restrictions = serializers.SerializerMethodField()

    def get_fitness_goals(self, obj):
        return list(obj.member_goals.values_list('goal__slug', flat=True))

    def get_dietary_restrictions(self, obj):
        return list(obj.member.dietary_restrictions.values_list('slug', flat=True))

    class Meta:
        model  = FitnessProfile
        fields = ['height_cm', 'weight_kg', 'activity_level', 'fitness_goals', 'dietary_restrictions']
