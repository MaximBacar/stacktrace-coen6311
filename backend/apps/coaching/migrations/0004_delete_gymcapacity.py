from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('coaching', '0003_gymcapacity'),
    ]

    operations = [
        migrations.DeleteModel(
            name='GymCapacity',
        ),
    ]
