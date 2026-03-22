from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_coachingsession_rejection_reason'),
        ('coaching', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            # Table is now owned by the coaching app — don't drop it
            database_operations=[],
            state_operations=[
                migrations.DeleteModel(name='CoachingSession'),
            ],
        ),
    ]
