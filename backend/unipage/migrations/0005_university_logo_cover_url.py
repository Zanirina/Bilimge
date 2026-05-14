from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('unipage', '0004_universityprogram_degree_years_studytype'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE universities
                    ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500) NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS cover_url VARCHAR(500) NOT NULL DEFAULT '';
            """,
            reverse_sql="""
                ALTER TABLE universities
                    DROP COLUMN IF EXISTS logo_url,
                    DROP COLUMN IF EXISTS cover_url;
            """,
        ),
    ]
