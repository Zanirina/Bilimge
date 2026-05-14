from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('unipage', '0003_academicmobility_entranceexam_entrancerequirement_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE university_programs
                    ADD COLUMN IF NOT EXISTS degree VARCHAR(20) NOT NULL DEFAULT 'bachelor',
                    ADD COLUMN IF NOT EXISTS years_of_study INTEGER NULL,
                    ADD COLUMN IF NOT EXISTS study_type VARCHAR(20) NOT NULL DEFAULT 'full_time';
            """,
            reverse_sql="""
                ALTER TABLE university_programs
                    DROP COLUMN IF EXISTS degree,
                    DROP COLUMN IF EXISTS years_of_study,
                    DROP COLUMN IF EXISTS study_type;
            """,
        ),
    ]
