from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('unipage', '0009_university_short_name'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE university_programs
                    ADD COLUMN IF NOT EXISTS cost INTEGER NULL;
            """,
            reverse_sql="""
                ALTER TABLE university_programs
                    DROP COLUMN IF EXISTS cost;
            """,
        ),
    ]
