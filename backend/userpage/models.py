from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'SUPER_ADMIN')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None  # убираем username

    class Role(models.TextChoices):
        APPLICANT = 'APPLICANT', 'Applicant'
        UNI_ADMIN = 'UNI_ADMIN', 'University Admin'
        NTC_ADMIN = 'NTC_ADMIN', 'NTC Admin'
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'

    email = models.EmailField(unique=True)  # email становится логином
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.APPLICANT)
    phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    avatar_url = models.URLField(max_length=500, blank=True, default='', verbose_name='Avatar URL')

    USERNAME_FIELD = 'email'        # логинимся по email
    REQUIRED_FIELDS = []            # createsuperuser не спрашивает лишнего

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_applicant(self):
        return self.role == self.Role.APPLICANT

    @property
    def is_uni_admin(self):
        return self.role == self.Role.UNI_ADMIN


class Applicant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='applicant_profile')
    birth_date = models.DateField(null=True, blank=True)
    unt_score = models.IntegerField(default=0)
    target_speciality = models.ForeignKey(
        'unipage.NtcProgram',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applicants',
        to_field='code',
        db_column='target_speciality_id',
        db_constraint=False
    )

    class Meta:
        db_table = 'applicant'

    def __str__(self):
        return f"Profile: {self.user.email}"


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    program = models.ForeignKey(
        'unipage.UniversityProgram',
        on_delete=models.CASCADE,
        to_field='code',
        db_column='program_id',
        db_constraint=False
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favorites'
        unique_together = ['user', 'program']

    def __str__(self):
        return f"{self.user.email} → {self.program_id}"


class UniversityStaff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    university = models.ForeignKey(
        'unipage.University',
        on_delete=models.RESTRICT,
        to_field='code',
        db_column='university_id',
        db_constraint=False
    )

    class Meta:
        db_table = 'university_staff'