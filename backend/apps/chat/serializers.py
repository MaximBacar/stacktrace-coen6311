from rest_framework import serializers

from apps.users.models import User
from .models import Chat, Message


class UserBriefSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name']

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()


class MessageSerializer(serializers.ModelSerializer):
    sender = UserBriefSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'sent_at']


class ChatSerializer(serializers.ModelSerializer):
    user1        = UserBriefSerializer(read_only=True)
    user2        = UserBriefSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'user1', 'user2', 'created_at', 'updated_at', 'last_message']

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return MessageSerializer(msg).data if msg else None
