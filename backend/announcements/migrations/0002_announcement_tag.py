from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('announcements', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='announcement',
            name='tag',
            field=models.CharField(
                blank=True,
                choices=[('event', 'Event'), ('scholarship', 'Scholarship'),
                         ('programme', 'Programme'), ('update', 'Update')],
                default='',
                max_length=20,
            ),
        ),
    ]
