from rest_framework import serializers

from .models import PolicyCategory, Policy, CancellationPolicy


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
