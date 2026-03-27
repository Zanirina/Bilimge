from django.contrib import admin


from .models import University, UniversityProgram,FieldOfStudy, NtcProgram, Subject

class UniversityAdmin(admin.ModelAdmin):
    list_display = ('code','name','city', 'address', 'year_established', 'email', 'phone', 'passing_score')

class UniversityProgramAdmin(admin.ModelAdmin):
    list_display = ('code', 'university_id', 'ntc_program_id', 'local_name', 'cost', 'language')

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
