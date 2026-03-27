from rest_framework import serializers
from .models import University, Subject, FieldOfStudy, NtcProgram, UniversityProgram

# 1. Serializer for uni
class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = '__all__'



# 3. Serializer for Field of Study
class FieldOfStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOfStudy
        fields = ['code', 'name']

# 2 Serializer for subject
class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']

# 4. Serializer for NTC programs
class NtcProgramSerializer(serializers.ModelSerializer):
    # Показываем детали группы и предметов вместо их ID
    field_of_study = FieldOfStudySerializer(read_only=True)
    subject_1 = SubjectSerializer(read_only=True)
    subject_2 = SubjectSerializer(read_only=True)

    class Meta:
        model = NtcProgram
        fields = ['code', 'name', 'field_of_study', 'subject_1', 'subject_2']

# 5. Serializer for uni program
class UniversityProgramSerializer(serializers.ModelSerializer):
    # Вкладываем данные об университете и базовой программе NTC
    university = UniversitySerializer(read_only=True)
    ntc_program = NtcProgramSerializer(read_only=True)

    class Meta:
        model = UniversityProgram
        fields = ['code', 'local_name', 'cost', 'language', 'university', 'ntc_program']