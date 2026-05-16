from rest_framework import serializers
from .models import User, Applicant, Favorite
from unipage.models import UniversityProgram, Subject


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password', 'phone']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            phone=validated_data.get('phone', ''),
            role=User.Role.APPLICANT
        )
        return user


class UserMeSerializer(serializers.ModelSerializer):
    birth_date = serializers.SerializerMethodField()
    unt_score = serializers.SerializerMethodField()
    subject_1 = serializers.SerializerMethodField()
    subject_2 = serializers.SerializerMethodField()
    subject_1_name = serializers.SerializerMethodField()
    subject_2_name = serializers.SerializerMethodField()
    favorites_count = serializers.SerializerMethodField()
    university_name = serializers.SerializerMethodField()
    university_code = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'role', 'created_at',
            'first_name', 'last_name', 'avatar_url',
            'birth_date', 'unt_score',
            'subject_1', 'subject_1_name',
            'subject_2', 'subject_2_name',
            'favorites_count',
            'university_name', 'university_code',
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

    def get_subject_1(self, obj):
        a = self._get_applicant(obj)
        return a.subject_1_id if a else None

    def get_subject_2(self, obj):
        a = self._get_applicant(obj)
        return a.subject_2_id if a else None

    def get_subject_1_name(self, obj):
        a = self._get_applicant(obj)
        return a.subject_1.name if a and a.subject_1 else None

    def get_subject_2_name(self, obj):
        a = self._get_applicant(obj)
        return a.subject_2.name if a and a.subject_2 else None

    def get_favorites_count(self, obj):
        return obj.favorites.count()

    def get_university_name(self, obj):
        try:
            return obj.staff_profile.university.name
        except Exception:
            return None

    def get_university_code(self, obj):
        try:
            return obj.staff_profile.university.code
        except Exception:
            return None


class UserUpdateSerializer(serializers.ModelSerializer):
    """PATCH /api/auth/me/ — update editable user fields."""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'avatar_url']

    def validate_email(self, value):
        qs = User.objects.exclude(pk=self.instance.pk).filter(email__iexact=value)
        if qs.exists():
            raise serializers.ValidationError('This email is already in use.')
        return value


class ApplicantProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    phone = serializers.CharField(source='user.phone', required=False)

    subject_1_name = serializers.CharField(source='subject_1.name', read_only=True)
    subject_2_name = serializers.CharField(source='subject_2.name', read_only=True)

    subject_1 = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        allow_null=True,
        required=False
    )
    subject_2 = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Applicant
        fields = [
            'email', 'first_name', 'last_name', 'phone',
            'birth_date', 'unt_score',
            'subject_1', 'subject_1_name',
            'subject_2', 'subject_2_name',
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