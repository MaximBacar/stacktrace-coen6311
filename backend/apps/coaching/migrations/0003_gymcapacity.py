
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('coaching', '0002_coachingsession_duration_alter_coachingsession_goals'),
    ]

    operations = [
        migrations.CreateModel(
            name='GymCapacity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current_count', models.PositiveIntegerField(default=0)),
                ('max_capacity', models.PositiveIntegerField(default=50)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
