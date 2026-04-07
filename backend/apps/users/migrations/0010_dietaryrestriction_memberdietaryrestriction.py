from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_merge_20260404_1820'),
    ]

    operations = [
        migrations.CreateModel(
            name='DietaryRestriction',
            fields=[
                ('id',   models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=50, unique=True)),
            ],
            options={
                'db_table': 'dietary_restrictions',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='MemberDietaryRestriction',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('member',     models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='member_dietary_restrictions', to='users.member')),
                ('restriction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='member_restrictions', to='users.dietaryrestriction')),
            ],
            options={
                'db_table': 'member_dietary_restrictions',
                'unique_together': {('member', 'restriction')},
            },
        ),
        migrations.AddField(
            model_name='member',
            name='dietary_restrictions',
            field=models.ManyToManyField(
                blank=True,
                related_name='members',
                through='users.MemberDietaryRestriction',
                to='users.dietaryrestriction',
            ),
        ),
    ]
