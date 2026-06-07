from django.db import models


class University(models.Model):
    class Meta:
        db_table = 'universities'
        managed = False

    code = models.IntegerField(primary_key=True, verbose_name='University Code')
    logo_url = models.URLField(max_length=500, blank=True, default='')
    cover_url = models.URLField(max_length=500, blank=True, default='')
    name = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True, default='')
    name_kk = models.CharField(max_length=255, blank=True, default='')
    short_name = models.CharField(max_length=100, blank=True, default='')
    city = models.CharField(max_length=100)
    city_ru = models.CharField(max_length=100, blank=True, default='')
    city_kk = models.CharField(max_length=100, blank=True, default='')
    address = models.CharField(max_length=255)
    address_ru = models.CharField(max_length=255, blank=True, default='')
    address_kk = models.CharField(max_length=255, blank=True, default='')
    year_established = models.IntegerField()
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=20)
    passing_score = models.IntegerField()
    history = models.TextField(blank=True, default='')
    history_ru = models.TextField(blank=True, default='')
    history_kk = models.TextField(blank=True, default='')
    website = models.URLField(max_length=255, blank=True, default='')
    has_dormitory = models.BooleanField(default=False)
    has_military_department = models.BooleanField(default=False)
    telegram_url = models.URLField(max_length=500, blank=True, default='')
    instagram_url = models.URLField(max_length=500, blank=True, default='')
    tuition_cost = models.IntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    def get_name(self, language='en'):
        if language == 'ru' and self.name_ru:
            return self.name_ru
        if language == 'kk' and self.name_kk:
            return self.name_kk
        return self.name

    def get_city(self, language='en'):
        if language == 'ru' and self.city_ru:
            return self.city_ru
        if language == 'kk' and self.city_kk:
            return self.city_kk
        return self.city

    def get_history(self, language='en'):
        if language == 'ru' and self.history_ru:
            return self.history_ru
        if language == 'kk' and self.history_kk:
            return self.history_kk
        return self.history

    def get_address(self, language='en'):
        if language == 'ru' and self.address_ru:
            return self.address_ru
        if language == 'kk' and self.address_kk:
            return self.address_kk
        return self.address

    def __str__(self):
        return f"{self.code} - {self.name}"

class Language(models.Model):
    class Meta:
        db_table = 'languages'
        managed = False

    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Subject(models.Model):
    class Meta:
        db_table = 'subject'
        managed = False

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True, default='')
    name_kk = models.CharField(max_length=255, blank=True, default='')

    def get_name(self, language='en'):
        if language == 'ru' and self.name_ru:
            return self.name_ru
        if language == 'kk' and self.name_kk:
            return self.name_kk
        return self.name

    def __str__(self):
        return self.name


class FieldOfStudy(models.Model):
    class Meta:
        db_table = 'field_of_study'
        managed = False

    code = models.CharField(max_length=255, primary_key=True)
    name = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True, default='')
    name_kk = models.CharField(max_length=255, blank=True, default='')

    def get_name(self, language='en'):
        if language == 'ru' and self.name_ru:
            return self.name_ru
        if language == 'kk' and self.name_kk:
            return self.name_kk
        return self.name


class NtcProgram(models.Model):
    class Meta:
        db_table = 'ntc_programs'
        managed = False

    code = models.CharField(max_length=20, primary_key=True)
    field_of_study = models.ForeignKey(FieldOfStudy, on_delete=models.RESTRICT, related_name='ntc_programs')
    name = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True, default='')
    name_kk = models.CharField(max_length=255, blank=True, default='')
    subject_1 = models.ForeignKey(Subject, on_delete=models.RESTRICT, related_name='subject_1')
    subject_2 = models.ForeignKey(Subject, on_delete=models.RESTRICT, related_name='subject_2')
    minimum_score = models.IntegerField(default=50)
    updated_at = models.DateTimeField(null=True, blank=True)

    def get_name(self, language='en'):
        if language == 'ru' and self.name_ru:
            return self.name_ru
        if language == 'kk' and self.name_kk:
            return self.name_kk
        return self.name


class UniversityProgram(models.Model):
    class Degree(models.TextChoices):
        COLLEGE = 'college', 'College'
        BACHELOR = 'bachelor', 'Bachelor'
        MASTER = 'master', 'Master'
        PHD = 'phd', 'PhD'

    class StudyType(models.TextChoices):
        FULL_TIME = 'full_time', 'Full-time'
        PART_TIME = 'part_time', 'Part-time'
        DISTANCE = 'distance', 'Distance'
        EVENING = 'evening', 'Evening'

    class Meta:
        db_table = 'university_programs'
        managed = False

    code = models.CharField(max_length=20, primary_key=True)
    university = models.ForeignKey(University, on_delete=models.RESTRICT, related_name='programs')
    ntc_program = models.ForeignKey(NtcProgram, on_delete=models.RESTRICT, related_name='programs')
    local_name = models.CharField(max_length=255)
    local_name_ru = models.CharField(max_length=255, blank=True, default='')
    local_name_kk = models.CharField(max_length=255, blank=True, default='')
    language = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    degree = models.CharField(max_length=20, choices=Degree.choices, default=Degree.BACHELOR, blank=True)
    years_of_study = models.PositiveIntegerField(null=True, blank=True)
    study_type = models.CharField(max_length=20, choices=StudyType.choices, default=StudyType.FULL_TIME, blank=True)
    description = models.TextField(blank=True, default='')
    description_ru = models.TextField(blank=True, default='')
    description_kk = models.TextField(blank=True, default='')
    cost = models.IntegerField(null=True, blank=True)
    passing_score = models.IntegerField(null=True, blank=True)
    grant_score = models.IntegerField(null=True, blank=True)
    future_professions = models.TextField(blank=True, default='')
    future_professions_ru = models.TextField(blank=True, default='')
    future_professions_kk = models.TextField(blank=True, default='')

    def get_local_name(self, language='en'):
        if language == 'ru' and self.local_name_ru:
            return self.local_name_ru
        if language == 'kk' and self.local_name_kk:
            return self.local_name_kk
        return self.local_name

    def get_description(self, language='en'):
        if language == 'ru' and self.description_ru:
            return self.description_ru
        if language == 'kk' and self.description_kk:
            return self.description_kk
        return self.description

    def get_future_professions(self, language='en'):
        if language == 'ru' and self.future_professions_ru:
            return self.future_professions_ru
        if language == 'kk' and self.future_professions_kk:
            return self.future_professions_kk
        return self.future_professions

    def __str__(self):
        return f"{self.code} - {self.local_name}"

class UniversityLanguage(models.Model):
    """Языки обучения в университете"""
    class Meta:
        db_table = 'university_languages'
        managed = False
        unique_together = ('university', 'language')

    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='teaching_languages')
    language = models.ForeignKey(Language, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.university_id} - {self.language_id}"


class EntranceRequirement(models.Model):
    class Meta:
        db_table = 'entrance_requirements'
        managed = False

    id = models.AutoField(primary_key=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='entrance_requirements')
    description = models.TextField(verbose_name='Requirement Description')
    description_ru = models.TextField(blank=True, default='')
    description_kk = models.TextField(blank=True, default='')

    def get_description(self, language='en'):
        if language == 'ru' and self.description_ru:
            return self.description_ru
        if language == 'kk' and self.description_kk:
            return self.description_kk
        return self.description




class EntranceExam(models.Model):
    class Meta:
        db_table = 'entrance_exams'
        managed = False

    id = models.AutoField(primary_key=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='entrance_exams')
    name = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True, default='')
    name_kk = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField(blank=True, default='')
    description_ru = models.TextField(blank=True, default='')
    description_kk = models.TextField(blank=True, default='')

    def get_name(self, language='en'):
        if language == 'ru' and self.name_ru:
            return self.name_ru
        if language == 'kk' and self.name_kk:
            return self.name_kk
        return self.name

    def get_description(self, language='en'):
        if language == 'ru' and self.description_ru:
            return self.description_ru
        if language == 'kk' and self.description_kk:
            return self.description_kk
        return self.description


class AcademicMobility(models.Model):
    """Академическая мобильность — партнёрские университеты"""
    class Meta:
        db_table = 'academic_mobility'
        managed = False

    id = models.AutoField(primary_key=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='academic_mobility')
    partner_university_name = models.CharField(max_length=255, verbose_name='Partner University')
    country = models.CharField(max_length=100, verbose_name='Country')

    def __str__(self):
        return f"{self.university_id} → {self.partner_university_name} ({self.country})"

class Accreditation(models.Model):
    class Meta:
        db_table = 'accreditations'
        managed = False

    id = models.AutoField(primary_key=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='accreditations')
    name = models.CharField(max_length=255, verbose_name='Accreditation Name')
    issued_by = models.CharField(max_length=255, blank=True, default='', verbose_name='Issued By')
    valid_until = models.DateField(null=True, blank=True, verbose_name='Valid Until')

    def __str__(self):
        return f"{self.university_id}: {self.name}"