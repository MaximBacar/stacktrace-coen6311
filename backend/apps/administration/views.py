from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.decorators import role_required
from apps.users.models import User, Coach, RoleChangeLog

from .serializers import (
    UserRoleSerializer,
    UserManagementSerializer,
    UserUpdateSerializer,
    CoachApprovalSerializer,
)


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


class AdminUserListView(APIView):
    @role_required('admin')
    def get(self, request):
        users = User.objects.order_by('first_name', 'last_name')
        return Response(UserManagementSerializer(users, many=True).data)


class AdminUserDetailView(APIView):
    @role_required('admin')
    def patch(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        user.refresh_from_db()
        return Response(UserManagementSerializer(user).data)


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