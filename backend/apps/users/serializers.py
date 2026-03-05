from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import Member, Coach, Administrator


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
    class Meta(BaseUserSerializer.Meta):
        model = Coach
        fields = BaseUserSerializer.Meta.fields + ['biography']


class AdminSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = Administrator
