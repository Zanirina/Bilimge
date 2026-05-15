from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('unipage', '0007_accreditation'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE universities
                    ADD COLUMN IF NOT EXISTS telegram_url VARCHAR(500) NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500) NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS tuition_cost INTEGER NULL;
            """,
            reverse_sql="""
                ALTER TABLE universities
                    DROP COLUMN IF EXISTS telegram_url,
                    DROP COLUMN IF EXISTS instagram_url,
                    DROP COLUMN IF EXISTS tuition_cost;
            """,
        ),
    ]
