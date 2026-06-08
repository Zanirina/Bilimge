from rest_framework import serializers
from .models import (
    University, Subject, FieldOfStudy, NtcProgram, UniversityProgram,
    Language, UniversityLanguage, EntranceRequirement, EntranceExam, AcademicMobility, Accreditation
)


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'name']


class SubjectSerializer(serializers.ModelSerializer):
    name_localized = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ['id', 'name', 'name_ru', 'name_kk', 'name_localized']

    def get_name_localized(self, obj):
        request = self.context.get('request')
        language = request.query_params.get('language', 'en') if request else 'en'
        return obj.get_name(language)


class FieldOfStudySerializer(serializers.ModelSerializer):
    name_localized = serializers.SerializerMethodField()

    class Meta:
        model = FieldOfStudy
        fields = ['code', 'name', 'name_ru', 'name_kk', 'name_localized']

    def get_name_localized(self, obj):
        request = self.context.get('request')
        language = request.query_params.get('language', 'en') if request else 'en'
        return obj.get_name(language)


class NtcProgramSerializer(serializers.ModelSerializer):
    field_of_study_name = serializers.CharField(source='field_of_study.name', read_only=True)
    field_of_study_name_localized = serializers.SerializerMethodField()
    subject_1_name = serializers.CharField(source='subject_1.name', read_only=True)
    subject_2_name = serializers.CharField(source='subject_2.name', read_only=True)
    subject_1_name_localized = serializers.SerializerMethodField()
    subject_2_name_localized = serializers.SerializerMethodField()
    name_localized = serializers.SerializerMethodField()

    class Meta:
        model = NtcProgram
        fields = [
            'code', 'name', 'name_ru', 'name_kk', 'name_localized',
            'field_of_study', 'field_of_study_name', 'field_of_study_name_localized',
            'subject_1', 'subject_1_name', 'subject_1_name_localized',
            'subject_2', 'subject_2_name', 'subject_2_name_localized',
            'minimum_score', 'updated_at',
        ]

    def _get_language(self):
        request = self.context.get('request')
        return request.query_params.get('language', 'en') if request else 'en'

    def get_name_localized(self, obj):
        return obj.get_name(self._get_language())

    def get_field_of_study_name_localized(self, obj):
        return obj.field_of_study.get_name(self._get_language())

    def get_subject_1_name_localized(self, obj):
        return obj.subject_1.get_name(self._get_language())

    def get_subject_2_name_localized(self, obj):
        return obj.subject_2.get_name(self._get_language())


class NtcProgramUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NtcProgram
        fields = ['name', 'name_ru', 'name_kk', 'field_of_study', 'subject_1', 'subject_2', 'minimum_score']


class EntranceRequirementSerializer(serializers.ModelSerializer):
    description_localized = serializers.SerializerMethodField()

    class Meta:
        model = EntranceRequirement
        fields = ['id', 'description', 'description_ru', 'description_kk', 'description_localized']

    def get_description_localized(self, obj):
        request = self.context.get('request')
        language = request.query_params.get('language', 'en') if request else 'en'
        return obj.get_description(language)


class EntranceExamSerializer(serializers.ModelSerializer):
    name_localized = serializers.SerializerMethodField()
    description_localized = serializers.SerializerMethodField()

    class Meta:
        model = EntranceExam
        fields = [
            'id',
            'name', 'name_ru', 'name_kk', 'name_localized',
            'description', 'description_ru', 'description_kk', 'description_localized',
        ]

    def _get_language(self):
        request = self.context.get('request')
        return request.query_params.get('language', 'en') if request else 'en'

    def get_name_localized(self, obj):
        return obj.get_name(self._get_language())

    def get_description_localized(self, obj):
        return obj.get_description(self._get_language())


class EntranceRequirementWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntranceRequirement
        fields = ['id', 'description', 'description_ru', 'description_kk']


class EntranceExamWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntranceExam
        fields = ['id', 'name', 'name_ru', 'name_kk', 'description', 'description_ru', 'description_kk']


class AcademicMobilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicMobility
        fields = ['id', 'partner_university_name', 'country']


class AcademicMobilityWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicMobility
        fields = ['id', 'partner_university_name', 'country']


class AccreditationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accreditation
        fields = ['id', 'name', 'issued_by', 'valid_until']


class UniversityProgramInFieldSerializer(serializers.ModelSerializer):
    language_name = serializers.CharField(source='language.name', read_only=True)
    local_name_localized = serializers.SerializerMethodField()

    class Meta:
        model = UniversityProgram
        fields = [
            'code', 'local_name', 'local_name_ru', 'local_name_kk', 'local_name_localized',
            'cost', 'passing_score', 'grant_score', 'language_name',
        ]

    def get_local_name_localized(self, obj):
        request = self.context.get('request')
        language = request.query_params.get('language', 'en') if request else 'en'
        return obj.get_local_name(language)


class FieldOfStudyWithProgramsSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField()
    programs = UniversityProgramInFieldSerializer(many=True)


class UniversityProgramDetailSerializer(serializers.ModelSerializer):
    field_of_study_code = serializers.CharField(source='ntc_program.field_of_study.code', read_only=True)
    field_of_study_name = serializers.CharField(source='ntc_program.field_of_study.name', read_only=True)
    field_of_study_name_localized = serializers.SerializerMethodField()
    ntc_program_name = serializers.CharField(source='ntc_program.name', read_only=True)
    ntc_program_name_localized = serializers.SerializerMethodField()
    university_name = serializers.CharField(source='university.name', read_only=True)
    university_name_localized = serializers.SerializerMethodField()
    language_name = serializers.CharField(source='language.name', read_only=True)
    subject_1 = serializers.CharField(source='ntc_program.subject_1.name', read_only=True)
    subject_2 = serializers.CharField(source='ntc_program.subject_2.name', read_only=True)
    subject_1_localized = serializers.SerializerMethodField()
    subject_2_localized = serializers.SerializerMethodField()
    local_name_localized = serializers.SerializerMethodField()
    description_localized = serializers.SerializerMethodField()
    future_professions_localized = serializers.SerializerMethodField()

    class Meta:
        model = UniversityProgram
        fields = [
            'code',
            'local_name', 'local_name_ru', 'local_name_kk', 'local_name_localized',
            'university', 'university_name', 'university_name_localized',
            'field_of_study_code', 'field_of_study_name', 'field_of_study_name_localized',
            'ntc_program', 'ntc_program_name', 'ntc_program_name_localized',
            'description', 'description_ru', 'description_kk', 'description_localized',
            'passing_score', 'grant_score',
            'cost', 'degree', 'years_of_study', 'study_type',
            'language', 'language_name',
            'subject_1', 'subject_2', 'subject_1_localized', 'subject_2_localized',
            'future_professions', 'future_professions_ru', 'future_professions_kk', 'future_professions_localized',
            'updated_at',
        ]

    def _get_language(self):
        request = self.context.get('request')
        return request.query_params.get('language', 'en') if request else 'en'

    def get_local_name_localized(self, obj):
        return obj.get_local_name(self._get_language())

    def get_description_localized(self, obj):
        return obj.get_description(self._get_language())

    def get_future_professions_localized(self, obj):
        return obj.get_future_professions(self._get_language())

    def get_field_of_study_name_localized(self, obj):
        return obj.ntc_program.field_of_study.get_name(self._get_language())

    def get_ntc_program_name_localized(self, obj):
        return obj.ntc_program.get_name(self._get_language())

    def get_university_name_localized(self, obj):
        return obj.university.get_name(self._get_language())

    def get_subject_1_localized(self, obj):
        return obj.ntc_program.subject_1.get_name(self._get_language())

    def get_subject_2_localized(self, obj):
        return obj.ntc_program.subject_2.get_name(self._get_language())


class UniversityPageSerializer(serializers.ModelSerializer):
    name_localized = serializers.SerializerMethodField()
    short_name_localized = serializers.SerializerMethodField()
    city_localized = serializers.SerializerMethodField()
    address_localized = serializers.SerializerMethodField()
    history_localized = serializers.SerializerMethodField()
    teaching_languages = serializers.SerializerMethodField()
    programs_by_field = serializers.SerializerMethodField()
    entrance_requirements = serializers.SerializerMethodField()
    entrance_exams = serializers.SerializerMethodField()
    academic_mobility = AcademicMobilitySerializer(many=True, read_only=True)
    accreditations = AccreditationSerializer(many=True, read_only=True)

    class Meta:
        model = University
        fields = [
            'code',
            'name', 'name_ru', 'name_kk', 'name_localized',
            'short_name', 'short_name_ru', 'short_name_kk', 'short_name_localized',
            'city', 'city_ru', 'city_kk', 'city_localized',
            'address', 'address_ru', 'address_kk', 'address_localized',
            'year_established', 'email', 'phone', 'website',
            'telegram_url', 'instagram_url', 'tuition_cost',
            'passing_score',
            'history', 'history_ru', 'history_kk', 'history_localized',
            'has_dormitory', 'has_military_department',
            'logo_url', 'cover_url',
            'teaching_languages', 'programs_by_field',
            'entrance_requirements', 'entrance_exams',
            'academic_mobility', 'accreditations', 'updated_at',
        ]

    def _get_language(self):
        request = self.context.get('request')
        if request:
            return request.query_params.get('language', 'en')
        return self.context.get('language', 'en')

    def get_name_localized(self, obj):
        return obj.get_name(self._get_language())

    def get_short_name_localized(self, obj):
        return obj.get_short_name(self._get_language())

    def get_city_localized(self, obj):
        return obj.get_city(self._get_language())

    def get_address_localized(self, obj):
        return obj.get_address(self._get_language())

    def get_history_localized(self, obj):
        return obj.get_history(self._get_language())

    def get_teaching_languages(self, obj):
        langs = obj.teaching_languages.select_related('language').all()
        return [ul.language.name for ul in langs]

    def get_entrance_requirements(self, obj):
        qs = obj.entrance_requirements.all()
        return EntranceRequirementSerializer(qs, many=True, context=self.context).data

    def get_entrance_exams(self, obj):
        qs = obj.entrance_exams.all()
        return EntranceExamSerializer(qs, many=True, context=self.context).data

    def get_programs_by_field(self, obj):
        language = self._get_language()
        programs = obj.programs.select_related(
            'ntc_program__field_of_study', 'language'
        ).all()

        grouped = {}
        for prog in programs:
            fos = prog.ntc_program.field_of_study
            if fos.code not in grouped:
                grouped[fos.code] = {
                    'code': fos.code,
                    'name': fos.name,
                    'name_localized': fos.get_name(language),
                    'programs': []
                }
            grouped[fos.code]['programs'].append(prog)

        result = []
        for group in grouped.values():
            result.append({
                'code': group['code'],
                'name': group['name'],
                'name_localized': group['name_localized'],
                'programs': UniversityProgramInFieldSerializer(
                    group['programs'], many=True, context=self.context
                ).data
            })
        return result


class UniversitySerializer(serializers.ModelSerializer):
    name_localized = serializers.SerializerMethodField()
    short_name_localized = serializers.SerializerMethodField()
    city_localized = serializers.SerializerMethodField()
    address_localized = serializers.SerializerMethodField()

    class Meta:
        model = University
        fields = [
            'code', 'logo_url', 'cover_url',
            'name', 'name_ru', 'name_kk', 'name_localized',
            'short_name', 'short_name_ru', 'short_name_kk', 'short_name_localized',
            'city', 'city_ru', 'city_kk', 'city_localized',
            'address', 'address_ru', 'address_kk', 'address_localized',
            'year_established', 'email', 'phone', 'passing_score',
            'history', 'history_ru', 'history_kk',
            'website', 'has_dormitory', 'has_military_department',
            'telegram_url', 'instagram_url', 'tuition_cost', 'updated_at',
        ]

    def _get_language(self):
        request = self.context.get('request')
        if request:
            return request.query_params.get('language', 'en')
        return self.context.get('language', 'en')

    def get_name_localized(self, obj):
        return obj.get_name(self._get_language())

    def get_short_name_localized(self, obj):
        return obj.get_short_name(self._get_language())

    def get_city_localized(self, obj):
        return obj.get_city(self._get_language())

    def get_address_localized(self, obj):
        return obj.get_address(self._get_language())


class UniversityUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = [
            'name', 'name_ru', 'name_kk',
            'short_name', 'short_name_ru', 'short_name_kk',
            'city', 'city_ru', 'city_kk',
            'address', 'address_ru', 'address_kk',
            'year_established', 'email', 'phone', 'website',
            'telegram_url', 'instagram_url', 'tuition_cost',
            'passing_score',
            'history', 'history_ru', 'history_kk',
            'has_dormitory', 'has_military_department', 'updated_at',
        ]


class UniversityProgramSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name', read_only=True)
    ntc_program_name = serializers.CharField(source='ntc_program.name', read_only=True)
    language_name = serializers.CharField(source='language.name', read_only=True)
    subject_1_name = serializers.CharField(source='ntc_program.subject_1.name', read_only=True)
    subject_2_name = serializers.CharField(source='ntc_program.subject_2.name', read_only=True)
    local_name_localized = serializers.SerializerMethodField()

    class Meta:
        model = UniversityProgram
        fields = [
            'code', 'university', 'university_name',
            'ntc_program', 'ntc_program_name',
            'subject_1_name', 'subject_2_name',
            'local_name', 'local_name_ru', 'local_name_kk', 'local_name_localized',
            'cost', 'language', 'language_name',
            'degree', 'years_of_study', 'study_type',
            'description', 'passing_score', 'grant_score',
            'future_professions', 'updated_at',
        ]

    def get_local_name_localized(self, obj):
        request = self.context.get('request')
        language = request.query_params.get('language', 'en') if request else 'en'
        return obj.get_local_name(language)


class UniversityProgramWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniversityProgram
        fields = [
            'code', 'ntc_program', 'local_name', 'local_name_ru', 'local_name_kk',
            'cost', 'language', 'degree', 'years_of_study', 'study_type',
            'description', 'description_ru', 'description_kk',
            'passing_score', 'grant_score',
            'future_professions', 'future_professions_ru', 'future_professions_kk',
        ]


class UniversityBasicUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = [
            'name', 'short_name', 'short_name_ru', 'short_name_kk',
            'city', 'address', 'phone', 'email', 'website',
        ]