from django.contrib import admin
from .models import Member

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'birth_date', 'gender', 'height', 'weight')
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    list_filter = ('gender',)
