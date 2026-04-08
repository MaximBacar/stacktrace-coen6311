import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0003_workoutplan_coach_alter_workoutexercise_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='workoutplan',
            name='source_plan',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assignments',
                to='workouts.workoutplan',
            ),
        ),
    ]
