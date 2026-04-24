from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Applicant, UniversityStaff


class UniversityStaffInline(admin.StackedInline):
    model = UniversityStaff
    extra = 0
    can_delete = False


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_active')
    list_filter = ('role',)
    fieldsets = UserAdmin.fieldsets + (
        ('Role and contacts', {'fields': ('role', 'phone')}),
    )
    inlines = [UniversityStaffInline]

    def get_queryset(self, request):
        return User.objects.all()

    def get_inline_instances(self, request, obj=None):
        if obj and obj.role == User.Role.UNI_ADMIN:
            return [UniversityStaffInline(self.model, self.admin_site)]
        return []

    def has_delete_permission(self, request, obj=None):
        return request.user.role == 'SUPER_ADMIN'


admin.site.register(Applicant)
admin.site.register(UniversityStaff)