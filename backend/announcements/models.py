from django.db import models
from django.conf import settings


class Announcement(models.Model):
    class AuthorType(models.TextChoices):
        NTC = 'ntc', 'NTC'
        UNIVERSITY = 'university', 'University'

    class Tag(models.TextChoices):
        EVENT = 'event', 'Event'
        SCHOLARSHIP = 'scholarship', 'Scholarship'
        PROGRAMME = 'programme', 'Programme'
        UPDATE = 'update', 'Update'

    class Meta:
        db_table = 'announcements'
        ordering = ['-created_at']

    image_url = models.URLField(max_length=500, blank=True, default='')
    title = models.CharField(max_length=255)
    title_ru = models.CharField(max_length=255, blank=True, default='')
    title_kk = models.CharField(max_length=255, blank=True, default='')
    body = models.TextField()
    body_ru = models.TextField(blank=True, default='')
    body_kk = models.TextField(blank=True, default='')
    tag = models.CharField(max_length=20, choices=Tag.choices, blank=True, default='')
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

    def get_title(self, language='en'):
        if language == 'ru' and self.title_ru:
            return self.title_ru
        if language == 'kk' and self.title_kk:
            return self.title_kk
        return self.title

    def get_body(self, language='en'):
        if language == 'ru' and self.body_ru:
            return self.body_ru
        if language == 'kk' and self.body_kk:
            return self.body_kk
        return self.body

    def __str__(self):
        return self.title


class GrantWinner(models.Model):
    class Meta:
        db_table = 'grant_winners'

    ikt = models.CharField(max_length=20)
    full_name = models.CharField(max_length=255)
    score = models.IntegerField()
    university_code = models.CharField(max_length=20)
    field_code = models.CharField(max_length=20)
    field_name = models.CharField(max_length=255)
    year = models.IntegerField(default=2025)

    def __str__(self):
        return f"{self.full_name} — {self.score} б."