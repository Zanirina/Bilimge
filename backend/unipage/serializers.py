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
    class Meta:
        model = Subject
        fields = '__all__'


class FieldOfStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOfStudy
        fields = '__all__'


class NtcProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = NtcProgram
        fields = '__all__'


# --- Для страницы программы ---

class UniversityProgramDetailSerializer(serializers.ModelSerializer):
    """GET /unipage/api/university-programs/<code>/"""
    field_of_study_code = serializers.CharField(source='ntc_program.field_of_study.code', read_only=True)
    field_of_study_name = serializers.CharField(source='ntc_program.field_of_study.name', read_only=True)
    ntc_program_name = serializers.CharField(source='ntc_program.name', read_only=True)
    language_name = serializers.CharField(source='language.name', read_only=True)
    subject_1 = serializers.CharField(source='ntc_program.subject_1.name', read_only=True)
    subject_2 = serializers.CharField(source='ntc_program.subject_2.name', read_only=True)
    university_name = serializers.CharField(source='university.name', read_only=True)

    class Meta:
        model = UniversityProgram
        fields = [
            'code', 'local_name', 'university', 'university_name',
            'field_of_study_code', 'field_of_study_name',
            'ntc_program', 'ntc_program_name',
            'description', 'passing_score', 'grant_score',
             'language', 'language_name',
            'subject_1', 'subject_2',
            'future_professions',
        ]



class EntranceRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntranceRequirement
        fields = ['id', 'description']


class EntranceExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntranceExam
        fields = ['id', 'name', 'description']


class AcademicMobilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicMobility
        fields = ['id', 'partner_university_name', 'country']


class UniversityProgramInFieldSerializer(serializers.ModelSerializer):
    """Программа внутри группы (FieldOfStudy) на странице университета"""
    language_name = serializers.CharField(source='language.name', read_only=True)

    class Meta:
        model = UniversityProgram
        fields = ['code', 'local_name', 'cost', 'passing_score', 'grant_score', 'language_name']


class FieldOfStudyWithProgramsSerializer(serializers.Serializer):
    """Группа ОП с вложенными программами университета"""
    code = serializers.CharField()
    name = serializers.CharField()
    programs = UniversityProgramInFieldSerializer(many=True)



class AccreditationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accreditation
        fields = ['id', 'name', 'issued_by', 'valid_until']



class UniversityPageSerializer(serializers.ModelSerializer):
    """GET /unipage/api/universities/<code>/ — полная страница университета"""
    teaching_languages = serializers.SerializerMethodField()
    programs_by_field = serializers.SerializerMethodField()
    entrance_requirements = EntranceRequirementSerializer(many=True, read_only=True)
    entrance_exams = EntranceExamSerializer(many=True, read_only=True)
    academic_mobility = AcademicMobilitySerializer(many=True, read_only=True)
    accreditations = AccreditationSerializer(many=True, read_only=True)

    class Meta:
        model = University
        fields = [
            'code', 'name', 'city', 'address', 'year_established',
            'email', 'phone', 'website',
            'telegram_url', 'instagram_url',
            'tuition_cost',
            'passing_score', 'history',
            'has_dormitory', 'has_military_department',
            'teaching_languages',
            'programs_by_field',
            'entrance_requirements',
            'entrance_exams',
            'academic_mobility',
            'accreditations',
        ]

    def get_teaching_languages(self, obj):
        langs = obj.teaching_languages.select_related('language').all()
        return [ul.language.name for ul in langs]

    def get_programs_by_field(self, obj):
        # Группируем программы университета по FieldOfStudy
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
                    'programs': []
                }
            grouped[fos.code]['programs'].append(prog)

        result = []
        for group in grouped.values():
            result.append({
                'code': group['code'],
                'name': group['name'],
                'programs': UniversityProgramInFieldSerializer(group['programs'], many=True).data
            })
        return result



class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = '__all__'


class UniversityUpdateSerializer(serializers.ModelSerializer):
    """PATCH /api/my-university/ — редактирование данных своего вуза"""
    class Meta:
        model = University
        fields = [
            'name', 'city', 'address', 'year_established',
            'email', 'phone', 'website',
            'telegram_url', 'instagram_url',
            'tuition_cost',
            'passing_score', 'history',
            'has_dormitory', 'has_military_department',
        ]


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
            'local_name', 'cost', 'language', 'language_name',
            'degree', 'years_of_study', 'study_type',
            'description', 'passing_score', 'grant_score', 'future_professions',
        ]


class UniversityProgramWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniversityProgram
        fields = [
            'code', 'ntc_program', 'local_name', 'cost', 'language',
            'degree', 'years_of_study', 'study_type',
            'description', 'passing_score', 'grant_score', 'future_professions',
        ]



class EntranceRequirementWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntranceRequirement
        fields = ['id', 'description']


class EntranceExamWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntranceExam
        fields = ['id', 'name', 'description']


class AcademicMobilityWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicMobility
        fields = ['id', 'partner_university_name', 'country']

class UniversityBasicUpdateSerializer(serializers.ModelSerializer):
    """NTC может менять только базовые поля"""
    class Meta:
        model = University
        fields = ['name', 'city', 'address', 'phone', 'email', 'website']


