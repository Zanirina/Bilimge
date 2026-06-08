from django.db import models
from django.conf import settings


class CalendarEvent(models.Model):
    class EventType(models.TextChoices):
        DEADLINE = 'deadline', 'Дедлайн'
        EXAM = 'exam', 'Экзамен'
        ENROLLMENT = 'enrollment', 'Приём документов'
        OPEN_DAY = 'open_day', 'День открытых дверей'
        EVENT = 'event', 'Мероприятие'
        ANNOUNCEMENT = 'announcement', 'Объявление'

    class Visibility(models.TextChoices):
        PUBLIC = 'public', 'Все'
        UNIVERSITY = 'university', 'Только подписчики вуза'
        PERSONAL = 'personal', 'Личное'

    title = models.CharField(max_length=255)
    title_ru = models.CharField(max_length=255, blank=True, default='')
    title_kk = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField(blank=True, default='')
    description_ru = models.TextField(blank=True, default='')
    description_kk = models.TextField(blank=True, default='')
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PUBLIC
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    university_id = models.IntegerField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='calendar_events'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    reminder_sent = models.BooleanField(default=False)

    class Meta:
        db_table = 'calendar_events'
        ordering = ['start_date', 'start_time']

    def get_title(self, language='en'):
        if language == 'ru' and self.title_ru:
            return self.title_ru
        if language == 'kk' and self.title_kk:
            return self.title_kk
        return self.title

    def get_description(self, language='en'):
        if language == 'ru' and self.description_ru:
            return self.description_ru
        if language == 'kk' and self.description_kk:
            return self.description_kk
        return self.description

    def __str__(self):
        return f"{self.title} ({self.start_date})"