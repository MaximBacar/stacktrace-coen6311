from rest_framework import serializers

from .models import Gym, PolicyCategory, Policy, CancellationPolicy, Equipment


class GymSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Gym
        fields = ['id', 'name', 'address', 'phone', 'email', 'description']


class EquipmentAvailabilitySerializer(serializers.ModelSerializer):
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    total_units = serializers.IntegerField(source='quantity', read_only=True)
    available_units = serializers.SerializerMethodField()
    availability_status = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = [
            'id', 'gym', 'gym_name', 'name', 'category',
            'total_units', 'available_units', 'status', 'availability_status', 'notes', 'updated_at',
        ]
        read_only_fields = ['id', 'gym_name', 'updated_at']

    def get_available_units(self, obj):
        if obj.status in {Equipment.Status.MAINTENANCE, Equipment.Status.RETIRED}:
            return 0
        open_issues = obj.issues.exclude(status='resolved').count()
        return max(obj.quantity - open_issues, 0)

    def get_availability_status(self, obj):
        if obj.status == Equipment.Status.MAINTENANCE:
            return 'maintenance'
        if obj.status == Equipment.Status.RETIRED:
            return 'unavailable'

        available_units = self.get_available_units(obj)
        if available_units == 0:
            return 'unavailable'
        if available_units < obj.quantity:
            return 'limited'
        return 'available'


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
