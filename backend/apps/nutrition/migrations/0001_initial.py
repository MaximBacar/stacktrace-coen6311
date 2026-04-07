from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='NutritionPlan',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('name',       models.CharField(max_length=200)),
                ('is_active',  models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('member',     models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='nutrition_plans', to='users.member')),
            ],
            options={'db_table': 'nutrition_plans'},
        ),
        migrations.CreateModel(
            name='MealDay',
            fields=[
                ('id',    models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('name',  models.CharField(max_length=100)),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('plan',  models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='days', to='nutrition.nutritionplan')),
            ],
            options={'db_table': 'meal_days', 'ordering': ['order']},
        ),
        migrations.CreateModel(
            name='Meal',
            fields=[
                ('id',        models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('meal_type', models.CharField(max_length=20, choices=[('Breakfast', 'Breakfast'), ('Lunch', 'Lunch'), ('Dinner', 'Dinner'), ('Snacks', 'Snacks')])),
                ('name',      models.CharField(max_length=200)),
                ('calories',  models.IntegerField(default=0)),
                ('protein',   models.DecimalField(decimal_places=1, default=0, max_digits=6)),
                ('carbs',     models.DecimalField(decimal_places=1, default=0, max_digits=6)),
                ('fat',       models.DecimalField(decimal_places=1, default=0, max_digits=6)),
                ('recipe_id', models.IntegerField(blank=True, null=True)),
                ('day',       models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='meals', to='nutrition.mealday')),
            ],
            options={'db_table': 'meals', 'ordering': ['meal_type']},
        ),
        migrations.CreateModel(
            name='MealLog',
            fields=[
                ('id',        models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('meal',      models.CharField(max_length=20, choices=[('Breakfast', 'Breakfast'), ('Lunch', 'Lunch'), ('Dinner', 'Dinner'), ('Snacks', 'Snacks')])),
                ('name',      models.CharField(max_length=200)),
                ('calories',  models.IntegerField(default=0)),
                ('protein',   models.DecimalField(decimal_places=1, default=0, max_digits=6)),
                ('carbs',     models.DecimalField(decimal_places=1, default=0, max_digits=6)),
                ('fat',       models.DecimalField(decimal_places=1, default=0, max_digits=6)),
                ('logged_at', models.DateTimeField(auto_now_add=True)),
                ('member',    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='meal_logs', to='users.member')),
            ],
            options={'db_table': 'meal_logs', 'ordering': ['logged_at']},
        ),
    ]