from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from apps.users.models import User, Coach, RoleChangeLog
from apps.users.utils import get_role


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id', 'email', 'first_name', 'last_name']


class RoleChangeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleChangeLog
        fields = '__all__'


class UserManagementSerializer(serializers.ModelSerializer):
    full_name    = serializers.SerializerMethodField()
    role         = serializers.SerializerMethodField()
    coach_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'coach_status', 'created_at']

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()

    def get_role(self, obj):
        return get_role(obj.pk)

    def get_coach_status(self, obj):
        try:
            return Coach.objects.get(pk=obj.pk).status
        except Coach.DoesNotExist:
            return None


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password']

    def validate_password(self, value):
        return make_password(value)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password_hash'] = validated_data.pop('password')
        return super().update(instance, validated_data)


class CoachApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coach
        fields = ['id', 'status', 'rejection_reason', 'is_active']

    def validate(self, data):
        if data.get('status') == 'rejected' and not data.get('rejection_reason'):
            raise serializers.ValidationError(
                {'rejection_reason': 'A rejection reason is required when rejecting a coach.'}
            )
        return data