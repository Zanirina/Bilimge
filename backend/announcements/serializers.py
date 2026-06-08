from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    author_avatar_url = serializers.SerializerMethodField()
    title_localized = serializers.SerializerMethodField()
    body_localized = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'image_url',
            'title', 'title_ru', 'title_kk', 'title_localized',
            'body', 'body_ru', 'body_kk', 'body_localized',
            'tag', 'author_type',
            'university_id', 'university_name',
            'author_avatar_url',
            'created_at', 'updated_at',
        ]

    def _get_language(self):
        request = self.context.get('request')
        return request.query_params.get('language', 'en') if request else 'en'

    def get_title_localized(self, obj):
        return obj.get_title(self._get_language())

    def get_body_localized(self, obj):
        return obj.get_body(self._get_language())

    def get_author_avatar_url(self, obj):
        return getattr(obj.created_by, 'avatar_url', '') or ''


class AnnouncementWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['title', 'title_ru', 'title_kk', 'body', 'body_ru', 'body_kk', 'tag']