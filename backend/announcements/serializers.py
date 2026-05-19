from rest_framework import serializers
from .models import Announcement

class AnnouncementSerializer(serializers.ModelSerializer):
    author_avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'body', 'tag', 'author_type',
                  'university_id', 'university_name', 'author_avatar_url',
                  'created_at']

    def get_author_avatar_url(self, obj):
        return getattr(obj.created_by, 'avatar_url', '') or ''


class AnnouncementWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['title', 'body', 'tag']