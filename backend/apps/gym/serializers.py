from rest_framework import serializers

from .models import Gym, PolicyCategory, Policy, CancellationPolicy


class GymSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Gym
        fields = ['id', 'name', 'address', 'phone', 'email', 'description']


class PolicyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = PolicyCategory
        fields = ['id', 'name', 'description']


class PolicySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model  = Policy
        fields = ['id', 'category', 'category_name', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class CancellationPolicySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model  = CancellationPolicy
        fields = [
            'id', 'category', 'category_name', 'title', 'content',
            'penalty_type', 'penalty_amount', 'notice_hours',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

from rest_framework import serializers
from .models import Gym

class GymCapacitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gym
        fields = ['id', 'name', 'max_capacity', 'current_occupancy']