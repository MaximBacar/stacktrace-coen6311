from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('gym', '0007_equipmentissue_reported_by'),
        ('coaching', '0003_gymrule'),
    ]

    operations = [
        migrations.CreateModel(
            name='EquipmentReservation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('status', models.CharField(choices=[('reserved', 'Reserved'), ('released', 'Released')], default='reserved', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('equipment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_reservations', to='gym.equipment')),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='equipment_reservations', to='coaching.coachingsession')),
            ],
            options={
                'db_table': 'equipment_reservations',
            },
        ),
    ]
