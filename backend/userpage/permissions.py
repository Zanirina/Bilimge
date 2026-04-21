from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'


class IsNtcAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['NTC_ADMIN', 'SUPER_ADMIN']


class IsUniAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['UNI_ADMIN', 'SUPER_ADMIN']


class IsApplicant(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'APPLICANT'


class IsUniAdminOfThisUniversity(BasePermission):
    """Uni Admin видит/редактирует только свой университет"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['UNI_ADMIN', 'SUPER_ADMIN']

    def has_object_permission(self, request, obj, view=None):
        if request.user.role == 'SUPER_ADMIN':
            return True
        try:
            return request.user.staff_profile.university_id == obj.code
        except Exception:
            return False


class ReadOnly(BasePermission):
    """Только чтение (GET, HEAD, OPTIONS)"""
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS