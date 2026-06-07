from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Applicant, UniversityStaff


class UniversityStaffInline(admin.StackedInline):
    model = UniversityStaff
    extra = 0
    can_delete = False
    fields = ('university',)


class ApplicantInline(admin.StackedInline):
    model = Applicant
    extra = 0
    can_delete = False
    fields = ('birth_date', 'unt_score', 'subject_1', 'subject_2')


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal information', {'fields': ('first_name', 'last_name', 'phone', 'avatar_url')}),
        ('Role', {'fields': ('role',)}),
        ('Access rights', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'phone'),
        }),
    )

    readonly_fields = ('created_at',)

    def get_inline_instances(self, request, obj=None):
        if obj and obj.role == User.Role.UNI_ADMIN:
            return [UniversityStaffInline(self.model, self.admin_site)]
        if obj and obj.role == User.Role.APPLICANT:
            return [ApplicantInline(self.model, self.admin_site)]
        return []

    def has_delete_permission(self, request, obj=None):
        return request.user.role == 'SUPER_ADMIN'


class UniversityStaffAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_email', 'university')
    search_fields = ('user__email', 'university__name')

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'


class ApplicantAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_email', 'unt_score', 'birth_date')
    search_fields = ('user__email',)

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'


admin.site.register(UniversityStaff, UniversityStaffAdmin)
admin.site.register(Applicant, ApplicantAdmin)