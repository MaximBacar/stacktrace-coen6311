from .models import Member, Coach, Administrator


def get_role(user_pk):
    if Member.objects.filter(pk=user_pk).exists():
        return 'member'
    if Coach.objects.filter(pk=user_pk).exists():
        return 'coach'
    if Administrator.objects.filter(pk=user_pk).exists():
        return 'admin'
    return None
