from django.db import models

from apps.users.models import Member


class AssistantConversation(models.Model):
    member     = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='assistant_conversations')
    title      = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class AssistantMessage(models.Model):
    conversation   = models.ForeignKey(AssistantConversation, on_delete=models.CASCADE, related_name='messages')
    content        = models.TextField()
    from_assistant = models.BooleanField(default=False)
    timestamp      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']
