from django.db import models
from django.conf import settings


class Announcement(models.Model):
    class AuthorType(models.TextChoices):
        NTC = 'ntc', 'NTC'
        UNIVERSITY = 'university', 'University'

    class Meta:
        db_table = 'announcements'
        ordering = ['-created_at']

    title = models.CharField(max_length=255)
    body = models.TextField()
    author_type = models.CharField(max_length=20, choices=AuthorType.choices)

    # Если от NTC — university null, если от универа — заполнено
    university = models.ForeignKey(
        'unipage.University',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='announcements'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title