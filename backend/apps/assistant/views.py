from rest_framework.response import Response
from rest_framework.views   import APIView
from rest_framework         import status

from apps.users.decorators import role_required
from apps.users.models     import Member

from .models import AssistantConversation, AssistantMessage
from .agent  import ask, generate_title


class ConversationListView(APIView):
    @role_required('member')
    def get(self, request):
        conversations = AssistantConversation.objects.filter(member_id=request.user_id)
        data = [{"id": c.id, "title": c.title, "created_at": c.created_at} for c in conversations]
        return Response(data)

    @role_required('member')
    def post(self, request):
        """Start a new conversation with the first user message."""
        question = request.data.get('message', '').strip()
        if not question:
            return Response({'error': 'message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = Member.objects.get(id=request.user_id)
        except Member.DoesNotExist:
            return Response({'error': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)

        title        = generate_title(question)
        conversation = AssistantConversation.objects.create(member=member, title=title)

        AssistantMessage.objects.create(conversation=conversation, content=question, from_assistant=False)

        reply         = ask(question, [], member_id=request.user_id)
        assistant_msg = AssistantMessage.objects.create(conversation=conversation, content=reply, from_assistant=True)

        return Response({
            "conversation_id": conversation.id,
            "title":           conversation.title,
            "reply": {
                "id":             assistant_msg.id,
                "content":        assistant_msg.content,
                "from_assistant": True,
                "timestamp":      assistant_msg.timestamp,
            },
        }, status=status.HTTP_201_CREATED)


class ConversationMessageView(APIView):
    @role_required('member')
    def get(self, request, conversation_id):
        try:
            conversation = AssistantConversation.objects.get(id=conversation_id, member_id=request.user_id)
        except AssistantConversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        messages = conversation.messages.values('id', 'content', 'from_assistant', 'timestamp')
        return Response({"conversation_id": conversation.id, "title": conversation.title, "messages": list(messages)})

    @role_required('member')
    def post(self, request, conversation_id):
        try:
            conversation = AssistantConversation.objects.get(id=conversation_id, member_id=request.user_id)
        except AssistantConversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        question = request.data.get('message', '').strip()
        if not question:
            return Response({'error': 'message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        AssistantMessage.objects.create(conversation=conversation, content=question, from_assistant=False)

        history = list(conversation.messages.order_by('timestamp').values('content', 'from_assistant'))
        reply   = ask(question, history[:-1], member_id=request.user_id)

        assistant_msg = AssistantMessage.objects.create(conversation=conversation, content=reply, from_assistant=True)

        return Response({
            "id":             assistant_msg.id,
            "content":        assistant_msg.content,
            "from_assistant": True,
            "timestamp":      assistant_msg.timestamp,
        }, status=status.HTTP_201_CREATED)

    @role_required('member')
    def delete(self, request, conversation_id):
        try:
            conversation = AssistantConversation.objects.get(id=conversation_id, member_id=request.user_id)
        except AssistantConversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        conversation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)