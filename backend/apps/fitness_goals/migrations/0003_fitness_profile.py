import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fitness_profile', '0002_alter_fitnessgoal_user'),
        ('users', '0010_dietaryrestriction_memberdietaryrestriction'),
    ]

    operations = [
        # Drop the old ad-hoc FitnessGoal model
        migrations.DeleteModel(name='FitnessGoal'),

        # Catalogue of available fitness goals
        migrations.CreateModel(
            name='FitnessGoal',
            fields=[
                ('id',   models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=50, unique=True)),
            ],
            options={
                'db_table': 'fitness_goals_catalogue',
                'ordering': ['name'],
            },
        ),

        # One profile per member (body metrics + activity level)
        migrations.CreateModel(
            name='FitnessProfile',
            fields=[
                ('id',             models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('height_cm',      models.DecimalField(blank=True, decimal_places=1, max_digits=5, null=True)),
                ('weight_kg',      models.DecimalField(blank=True, decimal_places=1, max_digits=5, null=True)),
                ('activity_level', models.CharField(
                    blank=True, max_length=20,
                    choices=[
                        ('sedentary', 'Sedentary'),
                        ('light',     'Lightly active'),
                        ('moderate',  'Moderately active'),
                        ('very',      'Very active'),
                        ('extreme',   'Extremely active'),
                    ],
                )),
                ('member', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='fitness_profile',
                    to='users.member',
                )),
            ],
            options={'db_table': 'fitness_profiles'},
        ),

        # Association: which goals a member has selected
        migrations.CreateModel(
            name='MemberFitnessGoal',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('profile', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='member_goals',
                    to='fitness_profile.fitnessprofile',
                )),
                ('goal', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='member_goals',
                    to='fitness_profile.fitnessgoal',
                )),
            ],
            options={
                'db_table':       'member_fitness_goals',
                'unique_together': {('profile', 'goal')},
            },
        ),
    ]
