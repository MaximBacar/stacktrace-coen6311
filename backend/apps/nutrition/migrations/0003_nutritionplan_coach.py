import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nutrition', '0002_nutritionplan_targets'),
        ('users', '0009_merge_20260404_1820'),
    ]

    operations = [
        migrations.AlterField(
            model_name='nutritionplan',
            name='member',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='nutrition_plans',
                to='users.member',
            ),
        ),
        migrations.AddField(
            model_name='nutritionplan',
            name='coach',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='nutrition_plans',
                to='users.coach',
            ),
        ),
    ]
