from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class User(AbstractUser):
    class Role(models.TextChoices):
        APPLICANT = 'APPLICANT', 'Applicant'
        UNI_ADMIN = 'UNI_ADMIN', 'University Admin'
        NTC_ADMIN = 'NTC_ADMIN', 'NTC Admin'
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.APPLICANT)
    phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'  # имя таблицы в БД

    def __str__(self):
        return f"{self.username} ({self.role})"

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
    target_speciality = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'applicant'

    def __str__(self):
        return f"Profile: {self.user.username}"


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