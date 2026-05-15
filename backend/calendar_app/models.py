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
    description = models.TextField(blank=True, default='')
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PUBLIC
    )

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)  # точное время начала
    end_time = models.TimeField(null=True, blank=True)    # точное время конца

    university_id = models.IntegerField(null=True, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='calendar_events'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'calendar_events'
        ordering = ['start_date', 'start_time']

    def __str__(self):
        return f"{self.title} ({self.start_date})"