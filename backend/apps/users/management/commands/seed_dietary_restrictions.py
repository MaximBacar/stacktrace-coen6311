from django.core.management.base import BaseCommand

from apps.users.models import DietaryRestriction


RESTRICTIONS = [
    ('Vegetarian',  'vegetarian'),
    ('Vegan',       'vegan'),
    ('Pescatarian', 'pescatarian'),
    ('Gluten-free', 'gluten_free'),
    ('Dairy-free',  'dairy_free'),
    ('Nut-free',    'nut_free'),
    ('Halal',       'halal'),
    ('Kosher',      'kosher'),
    ('Low-carb',    'low_carb'),
    ('Keto',        'keto'),
    ('Paleo',       'paleo'),
]


class Command(BaseCommand):
    help = 'Seed the DietaryRestriction table with the standard values.'

    def handle(self, *args, **options):
        created = 0
        for name, slug in RESTRICTIONS:
            _, was_created = DietaryRestriction.objects.get_or_create(slug=slug, defaults={'name': name})
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done — {created} restriction(s) created, {len(RESTRICTIONS) - created} already existed.'
        ))
