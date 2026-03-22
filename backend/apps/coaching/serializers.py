from django.db import transaction
from rest_framework import serializers

from apps.users.models import Member, Coach
from .models import CoachingSession


class CoachingSessionSerializer(serializers.ModelSerializer):
    member_id        = serializers.PrimaryKeyRelatedField(queryset=Member.objects.all(), source='member')
    coach_id         = serializers.PrimaryKeyRelatedField(queryset=Coach.objects.all(), source='coach')
    coach_name       = serializers.SerializerMethodField(read_only=True)
    coach_specialty  = serializers.CharField(source='coach.specialty', read_only=True)
    coach_avatar_url = serializers.URLField(source='coach.avatar_url', read_only=True)

    class Meta:
        model = CoachingSession
        fields = [
            'id', 'member_id', 'coach_id', 'coach_name', 'coach_specialty', 'coach_avatar_url',
            'scheduled_slot', 'duration', 'goals', 'status', 'rejection_reason', 'created_at',
        ]
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