from django.contrib import admin
from .models import University, UniversityProgram, FieldOfStudy, NtcProgram, Subject, EntranceRequirement, EntranceExam


class EntranceRequirementInline(admin.TabularInline):
    model = EntranceRequirement
    extra = 1
    fields = ['description', 'description_ru', 'description_kk']


class EntranceExamInline(admin.TabularInline):
    model = EntranceExam
    extra = 1
    fields = ['name', 'name_ru', 'name_kk', 'description', 'description_ru', 'description_kk']


class UniversityAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'city', 'passing_score', 'updated_at')
    search_fields = ('name', 'city', 'code')
    readonly_fields = ('code', 'updated_at')
    fieldsets = (
        ('General', {
            'fields': ('code', 'logo_url', 'cover_url', 'short_name', 'year_established',
                       'email', 'phone', 'website', 'passing_score', 'tuition_cost',
                       'has_dormitory', 'has_military_department',
                       'telegram_url', 'instagram_url', 'updated_at')
        }),
        ('Name', {
            'fields': ('name', 'name_ru', 'name_kk')
        }),
        ('City', {
            'fields': ('city', 'city_ru', 'city_kk')
        }),
        ('Address', {
            'fields': ('address', 'address_ru', 'address_kk')
        }),
        ('History', {
            'fields': ('history', 'history_ru', 'history_kk')
        }),
    )
    inlines = [EntranceRequirementInline, EntranceExamInline]


class UniversityProgramAdmin(admin.ModelAdmin):
    list_display = ('code', 'university_id', 'ntc_program_id', 'local_name', 'language', 'updated_at')
    search_fields = ('local_name', 'code')
    readonly_fields = ('get_subject_1', 'get_subject_2', 'updated_at')
    fieldsets = (
        ('General', {
            'fields': ('code', 'university', 'ntc_program', 'language',
                       'degree', 'years_of_study', 'study_type',
                       'cost', 'passing_score', 'grant_score',
                       'get_subject_1', 'get_subject_2', 'updated_at')
        }),
        ('Local Name', {
            'fields': ('local_name', 'local_name_ru', 'local_name_kk')
        }),
        ('Description', {
            'fields': ('description', 'description_ru', 'description_kk')
        }),
        ('Future Professions', {
            'fields': ('future_professions', 'future_professions_ru', 'future_professions_kk')
        }),
    )

    def get_subject_1(self, obj):
        return obj.ntc_program.subject_1.name if obj.ntc_program else '-'
    get_subject_1.short_description = 'Subject 1'

    def get_subject_2(self, obj):
        return obj.ntc_program.subject_2.name if obj.ntc_program else '-'
    get_subject_2.short_description = 'Subject 2'

    def has_delete_permission(self, request, obj=None):
        return False


class FieldOfStudyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'name_ru', 'name_kk')
    search_fields = ('name', 'code')
    readonly_fields = ('code',)
    fields = ('code', 'name', 'name_ru', 'name_kk')


class NtcProgramAdmin(admin.ModelAdmin):
    list_display = ('code', 'field_of_study', 'name', 'name_ru', 'name_kk', 'subject_1', 'subject_2')
    search_fields = ('name', 'code')
    readonly_fields = ('code', 'updated_at')
    fields = (
        'code', 'field_of_study',
        'name', 'name_ru', 'name_kk',
        'subject_1', 'subject_2',
        'minimum_score', 'updated_at',
    )


class SubjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'name_ru', 'name_kk')
    search_fields = ('name',)
    fields = ('name', 'name_ru', 'name_kk')


admin.site.register(University, UniversityAdmin)
admin.site.register(UniversityProgram, UniversityProgramAdmin)
admin.site.register(FieldOfStudy, FieldOfStudyAdmin)
admin.site.register(NtcProgram, NtcProgramAdmin)
admin.site.register(Subject, SubjectAdmin)