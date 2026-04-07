from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nutrition', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='nutritionplan',
            name='target_calories',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='nutritionplan',
            name='target_protein',
            field=models.DecimalField(decimal_places=1, default=0, max_digits=6),
        ),
        migrations.AddField(
            model_name='nutritionplan',
            name='target_carbs',
            field=models.DecimalField(decimal_places=1, default=0, max_digits=6),
        ),
        migrations.AddField(
            model_name='nutritionplan',
            name='target_fat',
            field=models.DecimalField(decimal_places=1, default=0, max_digits=6),
        ),
    ]
