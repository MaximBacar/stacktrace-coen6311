import base64
import io

from django.contrib.auth.hashers import check_password
from PIL import Image
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import User, Coach, Member, Administrator
from .serializers import (
    LoginSerializer,
    MemberSerializer,
    CoachSerializer,
    CoachDirectorySerializer,
    AdminSerializer,
)
from .decorators import role_required
from .utils import get_role


def _downscale_to_b64(data_uri: str, max_size: int = 256, quality: int = 72) -> str:
    """Receive a data-URI (base64 image), downscale to max_size×max_size, return new data-URI."""
    # Strip the "data:image/...;base64," prefix
    if ',' in data_uri:
        header, encoded = data_uri.split(',', 1)
    else:
        header, encoded = 'data:image/jpeg;base64', data_uri

    raw = base64.b64decode(encoded)
    img = Image.open(io.BytesIO(raw)).convert('RGB')
    img.thumbnail((max_size, max_size), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=quality, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return f'data:image/jpeg;base64,{b64}'


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
            user = serializer.save(role=role)
            return Response({'id': user.pk, 'role': role}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email    = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.password_hash):
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        refresh['role']      = get_role(user.pk)
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
        return Response(CoachDirectorySerializer(coaches, many=True).data, status=status.HTTP_200_OK)


class MemberAccountView(APIView):
    """GET / PATCH the calling member's account info (name, email, dob, gender, avatar)."""

    @role_required('member')
    def get(self, request):
        member = Member.objects.get(pk=request.user_id)
        return Response({
            'first_name': member.first_name,
            'last_name':  member.last_name,
            'email':      member.email,
            'dob':        member.dob.isoformat() if member.dob else '',
            'gender':     member.gender,
            'avatar_b64': member.avatar_b64,
        })

    @role_required('member')
    def patch(self, request):
        member = Member.objects.get(pk=request.user_id)

        for field in ('first_name', 'last_name', 'email', 'gender'):
            if field in request.data and request.data[field] is not None:
                setattr(member, field, request.data[field])

        if 'dob' in request.data and request.data['dob']:
            member.dob = request.data['dob']

        if 'avatar_b64' in request.data and request.data['avatar_b64']:
            member.avatar_b64 = _downscale_to_b64(request.data['avatar_b64'])

        member.save()
        return Response({
            'first_name': member.first_name,
            'last_name':  member.last_name,
            'email':      member.email,
            'dob':        member.dob.isoformat() if member.dob else '',
            'gender':     member.gender,
            'avatar_b64': member.avatar_b64,
        })

