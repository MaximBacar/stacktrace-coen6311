from django.contrib import admin
from .models import Coach, Administrator

@admin.register(Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'is_verified', 'created_at')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'specialization')
    list_filter = ('is_verified', 'created_at')
    list_editable = ('is_verified',)
    readonly_fields = ('created_at',)

admin.site.register(Administrator)
