from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import MemberSerializer, CoachSerializer, AdminSerializer

ROLE_SERIALIZERS = {
    'member': MemberSerializer,
    'coach': CoachSerializer,
    'admin': AdminSerializer,
}


class RegisterView(APIView):
    def post(self, request):
        role = request.data.get('role')
        serializer_class = ROLE_SERIALIZERS.get(role)

        if not serializer_class:
            return Response({'error': 'Invalid role. Must be member, coach, or admin.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'id': user.pk, 'role': role}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
