from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import Member, Coach, Administrator


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
    full_name      = serializers.SerializerMethodField()
    slots          = serializers.SerializerMethodField()
    sessions_count = serializers.SerializerMethodField()

    class Meta:
        model = Coach
        fields = [
            'id', 'first_name', 'last_name', 'full_name',
            'biography', 'specialty', 'rating', 'price', 'tags', 'avatar_url',
            'availability', 'slots', 'sessions_count',
        ]

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()

    def get_slots(self, obj):
        """Convert flat availability list ('Mon 09:30') to dict {'Mon': ['09:30', ...]}."""
        from collections import defaultdict
        result = defaultdict(list)
        for slot in (obj.availability or []):
            parts = slot.split(' ', 1)
            if len(parts) == 2:
                result[parts[0]].append(parts[1])
        return dict(result)

    def get_sessions_count(self, obj):
        return obj.booked_sessions.filter(status='accepted').count()



class AdminSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = Administrator
