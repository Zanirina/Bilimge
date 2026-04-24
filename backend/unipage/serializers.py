from rest_framework import serializers
from .models import University, Subject, FieldOfStudy, NtcProgram, UniversityProgram, Language


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = '__all__'


class FieldOfStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOfStudy
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class NtcProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = NtcProgram
        fields = '__all__'


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'


class UniversityProgramSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    ntc_program_name = serializers.CharField(source='ntc_program.name', read_only=True)
    language_name = serializers.CharField(source='language.name', read_only=True)
    subject_1_name = serializers.CharField(source='ntc_program.subject_1.name', read_only=True)
    subject_2_name = serializers.CharField(source='ntc_program.subject_2.name', read_only=True)

    class Meta:
        model = UniversityProgram
        fields = [
            'code', 'university', 'university_name',
            'ntc_program', 'ntc_program_name',
            'subject_1_name', 'subject_2_name',
            'local_name', 'cost',
            'language', 'language_name'
        ]


# Для Uni Admin — создание/редактирование программы своего вуза
class UniversityProgramWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniversityProgram
        fields = ['code', 'ntc_program', 'local_name', 'cost', 'language']
        # university не включаем — берём автоматически из профиля Uni Admin