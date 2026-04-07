from django.core.management.base import BaseCommand

from apps.fitness_goals.models import FitnessGoal


GOALS = [
    ('Lose weight',                    'lose_weight'),
    ('Build muscle',                   'build_muscle'),
    ('Improve endurance',              'improve_endurance'),
    ('Increase strength',              'increase_strength'),
    ('Improve flexibility',            'improve_flexibility'),
    ('Maintain fitness',               'maintain_fitness'),
    ('Improve cardiovascular health',  'improve_cardiovascular_health'),
    ('Reduce stress',                  'reduce_stress'),
]


class Command(BaseCommand):
    help = 'Seed the FitnessGoal catalogue table with standard values.'

    def handle(self, *args, **options):
        created = 0
        for name, slug in GOALS:
            _, was_created = FitnessGoal.objects.get_or_create(slug=slug, defaults={'name': name})
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done — {created} goal(s) created, {len(GOALS) - created} already existed.'
        ))
