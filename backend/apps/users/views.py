from django.contrib.auth.hashers import check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import User, Coach, Member, Administrator, RoleChangeLog
from .serializers import (
    LoginSerializer,
    MemberSerializer,
    CoachSerializer,
    CoachDirectorySerializer,
    AdminSerializer,
    UserRoleSerializer,
    CoachApprovalSerializer,
)
from .decorators import role_required


def _get_role(user_pk):
    if Member.objects.filter(pk=user_pk).exists():
        return 'member'
    if Coach.objects.filter(pk=user_pk).exists():
        return 'coach'
    if Administrator.objects.filter(pk=user_pk).exists():
        return 'admin'
    return None


ROLE_SERIALIZERS = {
    'member': MemberSerializer,
    'coach':  CoachSerializer,
    'admin':  AdminSerializer,
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
        refresh['role']      = _get_role(user.pk)
        refresh['email']     = user.email
        refresh['full_name'] = f'{user.first_name} {user.last_name}'.strip()

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)


class TokenRefreshView(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            access = refresh.access_token
            access['role']      = refresh.get('role')
            access['email']     = refresh.get('email')
            access['full_name'] = refresh.get('full_name')
            return Response({'access': str(access)}, status=status.HTTP_200_OK)
        except (InvalidToken, TokenError):
            return Response({'error': 'Invalid or expired refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)


class CoachListView(APIView):
    def get(self, request):
        coaches = Coach.objects.order_by('first_name', 'last_name')
        serializer = CoachDirectorySerializer(coaches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ── Role Management ───────────────────────────────────────────────────────────

class UserRoleUpdateView(APIView):
    @role_required('admin')
    def patch(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_role = request.data.get('role')
        old_role = target_user.role

        if old_role == 'admin' and new_role != 'admin':
            return Response(
                {'error': 'You cannot demote another administrator.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = UserRoleSerializer(target_user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()

        try:
            admin_user = User.objects.get(pk=request.user_id)
        except User.DoesNotExist:
            admin_user = None

        RoleChangeLog.objects.create(
            target_user=target_user,
            changed_by=admin_user,
            old_role=old_role,
            new_role=new_role,
        )

        return Response(serializer.data)


# ── Coach Approval ────────────────────────────────────────────────────────────

class CoachApprovalView(APIView):
    @role_required('admin')
    def patch(self, request, pk):
        try:
            coach = Coach.objects.get(pk=pk)
        except Coach.DoesNotExist:
            return Response({'error': 'Coach not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CoachApprovalSerializer(coach, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data)
