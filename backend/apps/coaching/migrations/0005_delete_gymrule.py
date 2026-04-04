from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('coaching', '0003_gymrule'),
        ('coaching', '0004_delete_gymcapacity'),
    ]

    operations = [
        migrations.DeleteModel(
            name='GymRule',
        ),
    ]
