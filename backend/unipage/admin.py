from django.contrib import admin


from .models import University, UniversityProgram, FieldOfStudy, NtcProgram, Subject

class UniversityAdmin(admin.ModelAdmin):
    list_display = ('code','name','name_ru','name_kk','city', 'address', 'year_established', 'email', 'phone', 'passing_score','history','history_ru','history_kk')


class UniversityProgramAdmin(admin.ModelAdmin):
    list_display = ('code', 'university_id', 'ntc_program_id', 'local_name','language')
    readonly_fields = ('get_subject_1', 'get_subject_2')

    def get_subject_1(self, obj):
        return obj.ntc_program.subject_1.name if obj.ntc_program else '-'

    get_subject_1.short_description = 'Subject 1'

    def get_subject_2(self, obj):
        return obj.ntc_program.subject_2.name if obj.ntc_program else '-'

    get_subject_2.short_description = 'Subject 2'

    def has_delete_permission(self, request, obj=None):
        return False

class FieldOfStudyAdmin(admin.ModelAdmin):
    list_display = ('code','name')

class NtcProgramAdmin(admin.ModelAdmin):
    list_display = ('code','field_of_study','name', 'subject_1', 'subject_2')

class SubjectAdmin(admin.ModelAdmin):
    list_display = ('id','name')


admin.site.register(University, UniversityAdmin)
admin.site.register(UniversityProgram, UniversityProgramAdmin)
admin.site.register(FieldOfStudy, FieldOfStudyAdmin)
admin.site.register(NtcProgram, NtcProgramAdmin)
admin.site.register(Subject, SubjectAdmin)

