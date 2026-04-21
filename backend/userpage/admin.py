from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Applicant, UniversityStaff


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_active')
    list_filter = ('role',)
    fieldsets = UserAdmin.fieldsets + (
        ('Роль и контакты', {'fields': ('role', 'phone')}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.role == 'SUPER_ADMIN':
            return qs
        # NTC и Uni Admin не видят других пользователей в админке
        return qs.filter(id=request.user.id)

    def has_delete_permission(self, request, obj=None):
        # Только Super Admin может удалять пользователей
        return request.user.role == 'SUPER_ADMIN'