from django.contrib.auth.hashers import check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Coach
from .serializers import (
    LoginSerializer,
    MemberSerializer,
    CoachSerializer,
    CoachDirectorySerializer,
    CoachingSessionSerializer,
    AdminSerializer,
)

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


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.password_hash):
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)


class CoachListView(APIView):
    def get(self, request):
        coaches = Coach.objects.order_by('first_name', 'last_name')
        serializer = CoachDirectorySerializer(coaches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CoachingSessionBookingView(APIView):
    def post(self, request):
        serializer = CoachingSessionSerializer(data=request.data)
        if serializer.is_valid():
            session = serializer.save()
            return Response(CoachingSessionSerializer(session).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
