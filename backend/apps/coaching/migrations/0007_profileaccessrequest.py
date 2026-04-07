import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('coaching', '0006_merge_0004_equipmentreservation_0005_delete_gymrule'),
        ('users', '0010_dietaryrestriction_memberdietaryrestriction'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProfileAccessRequest',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status',     models.CharField(
                    choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')],
                    default='pending',
                    max_length=20,
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('coach',  models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='access_requests_sent',     to='users.coach')),
                ('member', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='access_requests_received', to='users.member')),
            ],
            options={
                'db_table':       'profile_access_requests',
                'unique_together': {('coach', 'member')},
            },
        ),
    ]
