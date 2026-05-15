from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('unipage', '0005_university_logo_cover_url'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE ntc_programs
                    ADD COLUMN IF NOT EXISTS minimum_score INTEGER NOT NULL DEFAULT 50;
            """,
            reverse_sql="""
                ALTER TABLE ntc_programs
                    DROP COLUMN IF EXISTS minimum_score;
            """,
        ),
        migrations.AddField(
            model_name='ntcprogram',
            name='minimum_score',
            field=models.IntegerField(default=50, verbose_name='Minimum UNT Score'),
        ),
    ]
