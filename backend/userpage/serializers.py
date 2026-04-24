from rest_framework import serializers

from .models import User, Applicant, Favorite
from unipage.models import NtcProgram, UniversityProgram


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone=validated_data.get('phone', ''),
            role=User.Role.APPLICANT
        )
        return user


class UserMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'created_at']

class ApplicantProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)  # убрали read_only
    last_name = serializers.CharField(source='user.last_name', required=False)    # убрали read_only
    phone = serializers.CharField(source='user.phone', required=False)            # убрали read_only

    target_speciality_name = serializers.CharField(
        source='target_speciality.name',
        read_only=True
    )
    target_speciality = serializers.SlugRelatedField(
        slug_field='code',
        queryset=NtcProgram.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Applicant
        fields = [
            'username', 'email', 'first_name', 'last_name', 'phone',
            'birth_date', 'unt_score',
            'target_speciality',
            'target_speciality_name',
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})

        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class FavoriteSerializer(serializers.ModelSerializer):
    program_code = serializers.CharField(source='program.code', read_only=True)
    program_name = serializers.CharField(source='program.local_name', read_only=True)
    university_name = serializers.CharField(source='program.university.name', read_only=True)
    university_code = serializers.CharField(source='program.university.code', read_only=True)

    program = serializers.SlugRelatedField(
        slug_field='code',
        queryset=UniversityProgram.objects.all(),
    )

    class Meta:
        model = Favorite
        fields = [
            'id', 'program', 'program_code', 'program_name',  # добавили program_code
            'university_name', 'university_code', 'created_at'
        ]