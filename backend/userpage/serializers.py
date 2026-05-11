from rest_framework import serializers
from .models import User, Applicant, Favorite
from unipage.models import NtcProgram, UniversityProgram


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password', 'phone']  # убрали username

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            phone=validated_data.get('phone', ''),
            role=User.Role.APPLICANT
        )
        return user


class UserMeSerializer(serializers.ModelSerializer):
    # Поля из Applicant профиля (если есть)
    birth_date = serializers.SerializerMethodField()
    unt_score = serializers.SerializerMethodField()
    target_speciality = serializers.SerializerMethodField()
    target_speciality_name = serializers.SerializerMethodField()
    favorites_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'role', 'created_at',
            'first_name', 'last_name',
            # applicant-only поля (null для других ролей)
            'birth_date', 'unt_score',
            'target_speciality', 'target_speciality_name',
            'favorites_count',
        ]

    def _get_applicant(self, obj):
        try:
            return obj.applicant_profile
        except Exception:
            return None

    def get_birth_date(self, obj):
        a = self._get_applicant(obj)
        return a.birth_date if a else None

    def get_unt_score(self, obj):
        a = self._get_applicant(obj)
        return a.unt_score if a else None

    def get_target_speciality(self, obj):
        a = self._get_applicant(obj)
        return a.target_speciality.code if a and a.target_speciality else None

    def get_target_speciality_name(self, obj):
        a = self._get_applicant(obj)
        return a.target_speciality.name if a and a.target_speciality else None

    def get_favorites_count(self, obj):
        return obj.favorites.count()

class ApplicantProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    phone = serializers.CharField(source='user.phone', required=False)

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
            'email', 'first_name', 'last_name', 'phone',
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
            'id', 'program', 'program_code', 'program_name',
            'university_name', 'university_code', 'created_at'
        ]