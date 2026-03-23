from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.decorators import role_required
from apps.users.models import User
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer


class ChatListView(APIView):
    @role_required('member', 'coach')
    def get(self, request):
        """List all chats for the current user."""
        chats = (
            Chat.objects
            .filter(Q(user1_id=request.user_id) | Q(user2_id=request.user_id))
            .prefetch_related('messages')
            .select_related('user1', 'user2')
            .order_by('-updated_at')
        )
        return Response(ChatSerializer(chats, many=True).data)

    @role_required('member', 'coach')
    def post(self, request):
        """Get or create a chat with another user."""
        other_id = request.data.get('user_id')
        if not other_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not User.objects.filter(pk=other_id).exists():
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if int(other_id) == request.user_id:
            return Response({'error': 'Cannot chat with yourself.'}, status=status.HTTP_400_BAD_REQUEST)


        u1_id, u2_id = sorted([request.user_id, int(other_id)])

        chat, created = Chat.objects.get_or_create(user1_id=u1_id, user2_id=u2_id)
        chat_data = ChatSerializer(chat).data
        return Response(chat_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ChatMessageView(APIView):
    @role_required('member', 'coach')
    def get(self, request, chat_id):
        """Fetch messages in a chat. Pass ?since=<message_id> to get only new messages."""
        try:
            chat = Chat.objects.get(pk=chat_id)
        except Chat.DoesNotExist:
            return Response({'error': 'Chat not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user_id not in (chat.user1_id, chat.user2_id):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        messages = chat.messages.select_related('sender')
        since = request.query_params.get('since')
        if since:
            messages = messages.filter(id__gt=since)

        return Response(MessageSerializer(messages, many=True).data)

    @role_required('member', 'coach')
    def post(self, request, chat_id):
        try:
            chat = Chat.objects.get(pk=chat_id)
        except Chat.DoesNotExist:
            return Response({'error': 'Chat not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user_id not in (chat.user1_id, chat.user2_id):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(chat=chat, sender_id=request.user_id, content=content)
        chat.save(update_fields=['updated_at'])

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)