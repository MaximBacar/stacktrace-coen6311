
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('coaching', '0002_coachingsession_duration_alter_coachingsession_goals'),
    ]

    operations = [
        migrations.CreateModel(
            name='GymRule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
