from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_coachingsession'),
    ]

    operations = [
        migrations.AddField(
            model_name='coachingsession',
            name='rejection_reason',
            field=models.TextField(blank=True, default=''),
        ),
    ]
