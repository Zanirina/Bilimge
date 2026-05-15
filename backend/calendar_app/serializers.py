from rest_framework import serializers
from .models import CalendarEvent

class CalendarEventSerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)

    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'visibility',
            'start_date', 'end_date', 'start_time', 'end_time',
            'university_id', 'university_name',
            'created_by_email', 'created_at',
        ]

class CalendarEventWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = [
            'title', 'description', 'event_type',
            'start_date', 'end_date', 'start_time', 'end_time',
        ]


class CalendarEventUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = [
            'title', 'description', 'event_type',
            'start_date', 'end_date', 'start_time', 'end_time',
        ]