import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0004_coachingsession_rejection_reason'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            # Table already exists in the DB — no SQL needed
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name='CoachingSession',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('scheduled_slot', models.CharField(max_length=120)),
                        ('goals', models.TextField()),
                        ('status', models.CharField(default='booked', max_length=20)),
                        ('rejection_reason', models.TextField(blank=True, default='')),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('coach', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='booked_sessions', to='users.coach')),
                        ('member', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='coaching_sessions', to='users.member')),
                    ],
                    options={'db_table': 'coaching_sessions'},
                ),
            ],
        ),
    ]
