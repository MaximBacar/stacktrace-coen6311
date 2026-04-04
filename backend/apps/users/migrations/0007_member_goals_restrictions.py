
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_coach_avatar_url_coach_price_coach_rating_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='goals',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='member',
            name='restrictions',
            field=models.TextField(blank=True, default=''),
        ),
    ]
