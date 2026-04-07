from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_coach_avatar_url_coach_price_coach_rating_and_more'),
        ('gym', '0006_equipment_and_issue'),
    ]

    operations = [
        migrations.AddField(
            model_name='equipmentissue',
            name='reported_by',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='equipment_reports', to='users.member'),
            preserve_default=False,
        ),
    ]
