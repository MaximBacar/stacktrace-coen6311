from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='coach',
            name='availability',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
