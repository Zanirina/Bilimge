from .permissions import (
    IsSuperAdmin, IsNtcAdmin, IsUniAdmin,
    IsApplicant, IsUniAdminOfThisUniversity, ReadOnly
)


class SuperAdminMixin:
    """Только Super Admin"""
    permission_classes = [IsSuperAdmin]


class NtcAdminMixin:
    """NTC Admin и Super Admin"""
    permission_classes = [IsNtcAdmin]


class UniAdminMixin:
    """Uni Admin (только своего вуза) и Super Admin"""
    permission_classes = [IsUniAdminOfThisUniversity]


class ApplicantMixin:
    """Только абитуриент"""
    permission_classes = [IsApplicant]


class PublicReadMixin:
    """Все могут читать, писать — только авторизованные с нужной ролью"""
    permission_classes = [ReadOnly]