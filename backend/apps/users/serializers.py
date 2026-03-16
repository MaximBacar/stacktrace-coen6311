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
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Coach
        fields = ['id', 'first_name', 'last_name', 'full_name', 'biography', 'availability']

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()


class AdminSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = Administrator
