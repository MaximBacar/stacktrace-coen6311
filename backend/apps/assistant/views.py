from rest_framework.response    import Response
from rest_framework.views       import APIView
from rest_framework             import status
from django.conf                import settings

from apps.users.decorators  import role_required
from apps.users.models      import Member

from .models    import AssistantConversation, AssistantMessage
from openai     import OpenAI


client : OpenAI = OpenAI(api_key=settings.OPENAI_API_KEY)


SYSTEM_PROMPT : str = (
    "You are a helpful fitness club assistant. "
    "Answer questions about workouts, nutrition, scheduling, and gym policies. "
    "Be concise and friendly."
)

def _generate_title(first_question: str) -> str:
    response = client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=[
            {"role": "user", "content": (
                f"Generate a short title (5 words max, no quotes) for a conversation "
                f"that starts with this question: {first_question}"
            )},
        ],
        max_tokens=20,
    )
    return response.choices[0].message.content.strip()


def _ask_assistant(question: str, history: list[dict]) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history:
        role = "assistant" if msg["from_assistant"] else "user"
        messages.append({"role": role, "content": msg["content"]})
    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(model=settings.LLM_MODEL, messages=messages)
    return response.choices[0].message.content


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

        title = _generate_title(question)
        conversation = AssistantConversation.objects.create(member=member, title=title)

        AssistantMessage.objects.create(conversation=conversation, content=question, from_assistant=False)

        reply = _ask_assistant(question, [])
        assistant_msg = AssistantMessage.objects.create(conversation=conversation, content=reply, from_assistant=True)

        return Response({
            "conversation_id": conversation.id,
            "title": conversation.title,
            "reply": {
                "id": assistant_msg.id,
                "content": assistant_msg.content,
                "from_assistant": True,
                "timestamp": assistant_msg.timestamp,
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

        # exclude the message we just created from history passed to AI (it's already the last item)
        reply = _ask_assistant(question, history[:-1])

        assistant_msg = AssistantMessage.objects.create(conversation=conversation, content=reply, from_assistant=True)

        return Response({
            "id": assistant_msg.id,
            "content": assistant_msg.content,
            "from_assistant": True,
            "timestamp": assistant_msg.timestamp,
        }, status=status.HTTP_201_CREATED)

    @role_required('member')
    def delete(self, request, conversation_id):
        try:
            conversation = AssistantConversation.objects.get(id=conversation_id, member_id=request.user_id)
        except AssistantConversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

        conversation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)