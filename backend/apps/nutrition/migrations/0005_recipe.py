from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('nutrition', '0004_alter_meal_id_alter_mealday_id_alter_meallog_id_and_more'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Recipe',
            fields=[
                ('id',                   models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name',                 models.CharField(max_length=255)),
                ('description',          models.TextField(blank=True)),
                ('ingredients',          models.JSONField(default=list)),
                ('steps',                models.JSONField(default=list)),
                ('dietary_restrictions', models.JSONField(default=list)),
                ('calories',             models.IntegerField(default=0)),
                ('protein',              models.DecimalField(decimal_places=1, default=0, max_digits=6)),
                ('carbs',                models.DecimalField(decimal_places=1, default=0, max_digits=6)),
                ('fat',                  models.DecimalField(decimal_places=1, default=0, max_digits=6)),
                ('prep_time',            models.CharField(blank=True, max_length=50)),
                ('tags',                 models.JSONField(default=list)),
                ('prompt',               models.TextField(blank=True)),
                ('created_at',           models.DateTimeField(auto_now_add=True)),
                ('member',               models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recipes', to='users.member')),
            ],
            options={
                'db_table': 'recipes',
                'ordering': ['-created_at'],
            },
        ),
    ]
