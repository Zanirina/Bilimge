from django.db import models


class University(models.Model):
    class Meta:
        db_table = 'universities'
        managed = False

    code = models.IntegerField(max_length=20, primary_key=True, verbose_name='University Code')
    logo_url = models.URLField(max_length=500, blank=True, default='', verbose_name='Logo URL')
    cover_url = models.URLField(max_length=500, blank=True, default='', verbose_name='Cover URL')
    name = models.CharField(max_length=255, verbose_name='University Name')
    short_name = models.CharField(max_length=100, blank=True, default='', verbose_name='Short Name')
    city = models.CharField(max_length=100, verbose_name='City')
    address = models.CharField(max_length=255, verbose_name='University Address')
    year_established = models.IntegerField(verbose_name='Year Established')
    email = models.EmailField(max_length=255, verbose_name='Email Address')
    phone = models.CharField(max_length=20, verbose_name='Phone Number')
    passing_score = models.IntegerField(verbose_name='Passing Score')

    history = models.TextField(blank=True, default='', verbose_name='University History')
    website = models.URLField(max_length=255, blank=True, default='', verbose_name='Website')
    has_dormitory = models.BooleanField(default=False, verbose_name='Has Dormitory')
    has_military_department = models.BooleanField(default=False, verbose_name='Has Military Department')

    telegram_url = models.URLField(max_length=500, blank=True, default='', verbose_name='Telegram')
    instagram_url = models.URLField(max_length=500, blank=True, default='', verbose_name='Instagram')
    tuition_cost = models.IntegerField(null=True, blank=True, verbose_name='Tuition Cost')

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
    name = models.CharField(max_length=255, verbose_name='Subject Name')

    def __str__(self):
        return self.name


class FieldOfStudy(models.Model):
    class Meta:
        db_table = 'field_of_study'
        managed = False

    code = models.CharField(max_length=255, primary_key=True, verbose_name='Code of Field of Study')
    name = models.CharField(max_length=255, verbose_name='Naming of Field of Study')

    def __str__(self):
        return f"{self.code} - {self.name}"


class NtcProgram(models.Model):
    class Meta:
        db_table = 'ntc_programs'
        managed = False

    code = models.CharField(max_length=20, primary_key=True, verbose_name='Program Code')
    field_of_study = models.ForeignKey(FieldOfStudy, on_delete=models.RESTRICT, related_name='ntc_programs')
    name = models.CharField(max_length=255)
    subject_1 = models.ForeignKey(Subject, on_delete=models.RESTRICT, related_name='subject_1')
    subject_2 = models.ForeignKey(Subject, on_delete=models.RESTRICT, related_name='subject_2')
    minimum_score = models.IntegerField(default=50, verbose_name='Minimum UNT Score')

    def __str__(self):
        return f"{self.code} - {self.name}"


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

    code = models.CharField(max_length=20, primary_key=True, verbose_name='Program Code')
    university = models.ForeignKey(University, on_delete=models.RESTRICT, related_name='programs')
    ntc_program = models.ForeignKey(NtcProgram, on_delete=models.RESTRICT, related_name='programs')
    local_name = models.CharField(max_length=255, verbose_name='Name of University Program')
    language = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True, blank=True)

    degree = models.CharField(
        max_length=20, choices=Degree.choices, default=Degree.BACHELOR, blank=True,
        verbose_name='Degree Level'
    )
    years_of_study = models.PositiveIntegerField(null=True, blank=True, verbose_name='Years of Study')
    study_type = models.CharField(
        max_length=20, choices=StudyType.choices, default=StudyType.FULL_TIME, blank=True,
        verbose_name='Study Type'
    )

    description = models.TextField(blank=True, default='', verbose_name='Program Description')
    cost = models.IntegerField(null=True, blank=True, verbose_name='Tuition Cost')
    passing_score = models.IntegerField(null=True, blank=True, verbose_name='Passing Score for Program')
    grant_score = models.IntegerField(null=True, blank=True, verbose_name='Grant Passing Score')
    future_professions = models.TextField(blank=True, default='', verbose_name='Future Professions')

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
    """Вступительные требования университета"""
    class Meta:
        db_table = 'entrance_requirements'
        managed = False

    id = models.AutoField(primary_key=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='entrance_requirements')
    description = models.TextField(verbose_name='Requirement Description')

    def __str__(self):
        return f"{self.university_id}: {self.description[:50]}"


class EntranceExam(models.Model):
    """Вступительные экзамены университета"""
    class Meta:
        db_table = 'entrance_exams'
        managed = False

    id = models.AutoField(primary_key=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='entrance_exams')
    name = models.CharField(max_length=255, verbose_name='Exam Name')
    description = models.TextField(blank=True, default='', verbose_name='Exam Description')

    def __str__(self):
        return f"{self.university_id}: {self.name}"


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