from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .utils import get_role


class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.user_id = None
        request.user_role = None

        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token_str = auth_header.split(' ', 1)[1]
            try:
                token = AccessToken(token_str)
                request.user_id = int(token['user_id'])
                request.user_role = token.get('role') or get_role(request.user_id)
            except (InvalidToken, TokenError):
                pass

        return self.get_response(request)
