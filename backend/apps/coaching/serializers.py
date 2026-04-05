from django.db import transaction
from django.db.models import Sum
from rest_framework import serializers

from apps.gym.models import Equipment
from apps.users.models import Member, Coach
from .models import CoachingSession, EquipmentReservation


class EquipmentReservationSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    gym_name = serializers.CharField(source='equipment.gym.name', read_only=True)
    session_slot = serializers.CharField(source='session.scheduled_slot', read_only=True)
    coach_name = serializers.SerializerMethodField(read_only=True)
    member_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = EquipmentReservation
        fields = ['id', 'equipment', 'equipment_name', 'gym_name', 'session_slot', 'coach_name', 'member_name', 'quantity', 'status', 'created_at']
        read_only_fields = ['id', 'equipment_name', 'gym_name', 'session_slot', 'coach_name', 'member_name', 'status', 'created_at']

    def get_coach_name(self, obj):
        return f'{obj.session.coach.first_name} {obj.session.coach.last_name}'.strip()

    def get_member_name(self, obj):
        return f'{obj.session.member.first_name} {obj.session.member.last_name}'.strip()


class EquipmentReservationCreateSerializer(serializers.ModelSerializer):
    equipment = serializers.PrimaryKeyRelatedField(queryset=Equipment.objects.all())

    class Meta:
        model = EquipmentReservation
        fields = ['equipment', 'quantity']

    def validate(self, attrs):
        equipment = attrs['equipment']
        quantity = attrs['quantity']
        session = self.context['session']

        if quantity < 1:
            raise serializers.ValidationError({'quantity': 'Quantity must be at least 1.'})

        if equipment.status != Equipment.Status.ACTIVE:
            raise serializers.ValidationError({'equipment': 'Only active equipment can be reserved.'})

        issue_count = equipment.issues.exclude(status='resolved').count()
        reserved_count = (
            equipment.session_reservations
            .filter(status=EquipmentReservation.Status.RESERVED)
            .exclude(session=session)
            .aggregate(total=Sum('quantity'))
        )
        already_reserved = reserved_count.get('total') or 0
        available_units = max(equipment.quantity - issue_count - already_reserved, 0)

        if quantity > available_units:
            raise serializers.ValidationError({
                'quantity': f'Only {available_units} unit(s) are currently available for reservation.'
            })

        return attrs


class CoachingSessionSerializer(serializers.ModelSerializer):
    member_id        = serializers.PrimaryKeyRelatedField(queryset=Member.objects.all(), source='member')
    coach_id         = serializers.PrimaryKeyRelatedField(queryset=Coach.objects.all(), source='coach')
    coach_name       = serializers.SerializerMethodField(read_only=True)
    coach_specialty  = serializers.CharField(source='coach.specialty', read_only=True)
    coach_avatar_url = serializers.URLField(source='coach.avatar_url', read_only=True)
    member_name      = serializers.SerializerMethodField(read_only=True)
    equipment_reservations = EquipmentReservationSerializer(many=True, read_only=True)

    class Meta:
        model = CoachingSession
        fields = [
            'id', 'member_id', 'coach_id', 'coach_name', 'coach_specialty', 'coach_avatar_url',
            'member_name', 'scheduled_slot', 'duration', 'goals', 'status', 'rejection_reason', 'created_at',
            'equipment_reservations',
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

    def get_member_name(self, obj):
        return f'{obj.member.first_name} {obj.member.last_name}'.strip()
