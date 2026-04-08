import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nutrition', '0005_recipe'),
    ]

    operations = [
        migrations.AddField(
            model_name='nutritionplan',
            name='source_plan',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assignments',
                to='nutrition.nutritionplan',
            ),
        ),
    ]
