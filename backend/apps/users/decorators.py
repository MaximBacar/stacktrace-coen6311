from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView


def role_required(*roles):
    """
    Restricts a view to users with one of the given roles.

    Usage on view method:
        @role_required('coach', 'admin')
        def post(self, request, ...):
    """
    def decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):
            request = args[1] if args and isinstance(args[0], APIView) else args[0]

            if not getattr(request, 'user_id', None):
                return Response(
                    {'error': 'Authentication required.'},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            if getattr(request, 'user_role', None) not in roles:
                return Response(
                    {'error': 'Permission denied.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

            return func(*args, **kwargs)
        return wrapped
    return decorator