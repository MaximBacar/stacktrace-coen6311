from django.contrib.auth.hashers import make_password
from django.db import transaction
from rest_framework import serializers
from .models import Member, Coach, Administrator, CoachingSession


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class BaseUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        fields = ['email', 'first_name', 'last_name', 'password']

    def validate_password(self, value):
        return make_password(value)

    def create(self, validated_data):
        validated_data['password_hash'] = validated_data.pop('password')
        return super().create(validated_data)


class MemberSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = Member
        fields = BaseUserSerializer.Meta.fields + ['dob', 'height']


class CoachSerializer(BaseUserSerializer):
    availability = serializers.ListField(
        child=serializers.CharField(max_length=120),
        allow_empty=True,
        required=False,
    )

    class Meta(BaseUserSerializer.Meta):
        model = Coach
        fields = BaseUserSerializer.Meta.fields + ['biography', 'availability']


class CoachDirectorySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Coach
        fields = ['id', 'first_name', 'last_name', 'full_name', 'biography', 'availability']

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()


class CoachingSessionSerializer(serializers.ModelSerializer):
    member_id = serializers.PrimaryKeyRelatedField(queryset=Member.objects.all(), source='member')
    coach_id = serializers.PrimaryKeyRelatedField(queryset=Coach.objects.all(), source='coach')
    coach_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CoachingSession
        fields = ['id', 'member_id', 'coach_id', 'coach_name', 'scheduled_slot', 'goals', 'status', 'rejection_reason', 'created_at']
        read_only_fields = ['id', 'status', 'rejection_reason', 'created_at']

    def validate(self, attrs):
        coach = attrs['coach']
        scheduled_slot = attrs['scheduled_slot']

        if scheduled_slot not in (coach.availability or []):
            raise serializers.ValidationError({
                'scheduled_slot': 'This time slot is no longer available for the selected coach.'
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        coach = validated_data['coach']
        scheduled_slot = validated_data['scheduled_slot']
        availability = list(coach.availability or [])
        availability.remove(scheduled_slot)
        coach.availability = availability
        coach.save(update_fields=['availability'])
        return super().create(validated_data)

    def get_coach_name(self, obj):
        return f'{obj.coach.first_name} {obj.coach.last_name}'.strip()


class AdminSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = Administrator
