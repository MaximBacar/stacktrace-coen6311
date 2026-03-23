from django.db import models

from apps.users.models import User


class Chat(models.Model):
    user1      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats_as_user1')
    user2      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats_as_user2')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user1', 'user2')


class Message(models.Model):
    chat       = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content    = models.TextField()
    sent_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sent_at']
