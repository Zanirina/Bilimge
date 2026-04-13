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
        fields = '__all__'

# 2 Serializer for subject
class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

# 4. Serializer for NTC programs
class NtcProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = NtcProgram
        fields = '__all__'

# 5. Serializer for uni program
class UniversityProgramSerializer(serializers.ModelSerializer):

    class Meta:
        model = UniversityProgram
        fields = '__all__'