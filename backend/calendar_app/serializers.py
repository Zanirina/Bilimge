from rest_framework import serializers
from .models import CalendarEvent


class CalendarEventSerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    title_localized = serializers.SerializerMethodField()
    description_localized = serializers.SerializerMethodField()

    class Meta:
        model = CalendarEvent
        fields = [
            'id',
            'title', 'title_ru', 'title_kk', 'title_localized',
            'description', 'description_ru', 'description_kk', 'description_localized',
            'event_type', 'visibility',
            'start_date', 'end_date', 'start_time', 'end_time',
            'university_id',
            'created_by_email', 'created_at',
        ]

    def _get_language(self):
        request = self.context.get('request')
        return request.query_params.get('language', 'en') if request else 'en'

    def get_title_localized(self, obj):
        return obj.get_title(self._get_language())

    def get_description_localized(self, obj):
        return obj.get_description(self._get_language())


class CalendarEventWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = [
            'title', 'title_ru', 'title_kk',
            'description', 'description_ru', 'description_kk',
            'event_type',
            'start_date', 'end_date', 'start_time', 'end_time',
        ]


class CalendarEventUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = [
            'title', 'title_ru', 'title_kk',
            'description', 'description_ru', 'description_kk',
            'event_type',
            'start_date', 'end_date', 'start_time', 'end_time',
        ]