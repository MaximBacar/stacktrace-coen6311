from rest_framework import serializers

from .models import Gym, PolicyCategory, Policy, CancellationPolicy


class GymSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Gym
        fields = ['id', 'name', 'address', 'phone', 'email', 'description']


class GymCapacitySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Gym
        fields = [
            'id', 'name', 'max_capacity', 'current_occupancy',
            'occupancy_percentage', 'occupancy_status',
        ]
        read_only_fields = ['id', 'name', 'occupancy_percentage', 'occupancy_status']

    def validate(self, data):
        instance = self.instance
        current  = data.get('current_occupancy', instance.current_occupancy if instance else 0)
        maximum  = data.get('max_capacity',       instance.max_capacity      if instance else 1)
        if maximum < 1:
            raise serializers.ValidationError({'max_capacity': 'Max capacity must be at least 1.'})
        if current < 0:
            raise serializers.ValidationError({'current_occupancy': 'Current occupancy cannot be negative.'})
        if current > maximum:
            raise serializers.ValidationError({'current_occupancy': 'Current occupancy cannot exceed max capacity.'})
        return data


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
