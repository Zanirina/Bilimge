from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('unipage', '0008_university_social_tuition'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE universities
                    ADD COLUMN IF NOT EXISTS short_name VARCHAR(100) NOT NULL DEFAULT '';
            """,
            reverse_sql="""
                ALTER TABLE universities
                    DROP COLUMN IF EXISTS short_name;
            """,
        ),
    ]
