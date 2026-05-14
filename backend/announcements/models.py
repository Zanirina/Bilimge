from django.db import models
from django.conf import settings


class Announcement(models.Model):
    class AuthorType(models.TextChoices):
        NTC = 'ntc', 'NTC'
        UNIVERSITY = 'university', 'University'

    class Meta:
        db_table = 'announcements'
        ordering = ['-created_at']

    image_url = models.URLField(max_length=500, blank=True, default='', verbose_name='Image URL')
    title = models.CharField(max_length=255)
    body = models.TextField()
    author_type = models.CharField(max_length=20, choices=AuthorType.choices)

    university_id = models.IntegerField(null=True, blank=True)
    university_name = models.CharField(max_length=255, blank=True, default='')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class GrantWinner(models.Model):
    class Meta:
        db_table = 'grant_winners'


    ikt = models.CharField(max_length=20, verbose_name='ИКТ')
    full_name = models.CharField(max_length=255, verbose_name='ФИО')
    score = models.IntegerField(verbose_name='Сумма баллов')
    university_code = models.CharField(max_length=20, verbose_name='Код ОВПО')
    field_code = models.CharField(max_length=20, verbose_name='Код специальности')  # B001, B006 и т.д.
    field_name = models.CharField(max_length=255, verbose_name='Специальность')
    year = models.IntegerField(verbose_name='Учебный год', default=2025)

    def __str__(self):
        return f"{self.full_name} — {self.score} б."