from django.db import models


class University(models.Model):
    """University Model"""

    class Meta:
        db_table = 'universities'
        managed = False

    code = models.CharField(
        max_length=20,
        primary_key=True,
        verbose_name='University Code'
    )
    name = models.CharField(max_length=255, verbose_name='University Name')
    city = models.CharField(max_length=100, verbose_name='City')
    address = models.CharField(max_length=255, verbose_name='University Address')
    year_established = models.IntegerField(verbose_name='Year Established')
    email = models.EmailField(max_length=255, verbose_name='Email Address')
    phone = models.CharField(max_length=20, verbose_name='Phone Number')
    passing_score = models.IntegerField(verbose_name='Passing Score')


    def __str__(self):
        return f"{self.code} - {self.name}"

class Subject(models.Model):
    """Subject Model"""
    class Meta:
        db_table = 'subject'
        managed = False

    id = models.AutoField(primary_key=True)
    name = models.CharField(
        max_length=255,
        verbose_name='Subject Name'
    )

    def __str__(self):
        return f"{self.name}"

class FieldOfStudy(models.Model):
    """OP Groups Model"""

    class Meta:
        db_table = 'field_of_study'
        managed = False

    code = models.CharField(
        max_length=255,
        primary_key=True,
        verbose_name='Code of Field of Study'
    )

    name = models.CharField(
        max_length=255,
        verbose_name='Naming of Field of Study'
    )

    def __str__(self):
        return f"{self.code} - {self.name}"


class NtcProgram(models.Model):
    """NTC Program Model"""

    class Meta:
        db_table = 'ntc_programs'
        managed = False

    code = models.CharField(
        max_length=20,
        primary_key=True,
        verbose_name='Program Code'
    )

    field_of_study = models.ForeignKey(
        FieldOfStudy,
        on_delete=models.RESTRICT,
        related_name='ntc_programs',
        verbose_name = 'Field of Study'
    )
    name = models.CharField(
        max_length=255,
    )

    subject_1 = models.ForeignKey(
        Subject,
        on_delete=models.RESTRICT,
        related_name='subject_1',
    )
    subject_2 = models.ForeignKey(
        Subject,
        on_delete=models.RESTRICT,
        related_name='subject_2',
    )


    def __str__(self):
        return f"{self.code} - {self.name}"

class UniversityProgram(models.Model):
    """University Program Model"""

    class Meta:
        db_table = 'university_programs'
        managed = False

    code = models.CharField(
        max_length=20,
        primary_key=True,
        verbose_name='Program Code'
    )

    university = models.ForeignKey(
        University,
        on_delete=models.RESTRICT,
        related_name='programs'
    )

    ntc_program = models.ForeignKey(
        NtcProgram,
        on_delete=models.RESTRICT,
        related_name='programs'
    )


    local_name = models.CharField(
        max_length=255,
        verbose_name='Name of University Program'
    )

    cost = models.IntegerField(
        verbose_name='Cost of University Program')

    language = models.CharField(
        max_length=255,
    )

    def __str__(self):
        return f"{self.code} - {self.local_name}"



