from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from apps.users.models import Coach

COACHES = [
    {
        'email':      'marcus.delacroix@stacktrace.com',
        'first_name': 'Marcus',
        'last_name':  'Delacroix',
        'biography':  'Former competitive powerlifter with 11 years coaching athletes from beginners to nationals. Specialises in structured programming and long-term strength development.',
        'specialty':  'Strength & Conditioning',
        'rating':     4.9,
        'price':      65,
        'tags':       ['Powerlifting', 'Hypertrophy', 'Programming'],
        'avatar_url': 'https://picsum.photos/seed/delacroix/200/200',
        'availability': [
            'Mon 08:00', 'Mon 09:30', 'Mon 11:00', 'Mon 16:00',
            'Tue 07:30', 'Tue 10:00', 'Tue 14:00',
            'Wed 08:00', 'Wed 13:00', 'Wed 17:30',
            'Thu 09:00', 'Thu 11:30', 'Thu 15:00', 'Thu 18:00',
            'Fri 07:00', 'Fri 09:00', 'Fri 12:30',
        ],
    },
    {
        'email':      'petra.vanholt@stacktrace.com',
        'first_name': 'Petra',
        'last_name':  'Vanholt',
        'biography':  'Registered dietitian specialising in body recomposition and endurance fueling strategies. Combines nutrition science with practical training advice.',
        'specialty':  'Sports Nutrition & Performance',
        'rating':     4.8,
        'price':      55,
        'tags':       ['Nutrition', 'Endurance', 'Recomposition'],
        'avatar_url': 'https://picsum.photos/seed/vanholt/200/200',
        'availability': [
            'Mon 10:00', 'Mon 14:00', 'Mon 16:30',
            'Wed 09:00', 'Wed 13:00',
            'Fri 08:30', 'Fri 11:00', 'Fri 15:00',
        ],
    },
    {
        'email':      'yuki.tanaka@stacktrace.com',
        'first_name': 'Yuki',
        'last_name':  'Tanaka',
        'biography':  'Certified physical therapist and movement coach. Specialises in injury prevention and athletic longevity through mobility and recovery protocols.',
        'specialty':  'Mobility & Recovery',
        'rating':     5.0,
        'price':      70,
        'tags':       ['Mobility', 'Recovery', 'Injury Prevention'],
        'avatar_url': 'https://picsum.photos/seed/tanaka/200/200',
        'availability': [
            'Tue 08:00', 'Tue 10:30', 'Tue 13:00',
            'Thu 08:30', 'Thu 11:00', 'Thu 14:30', 'Thu 17:00',
            'Sat 09:00', 'Sat 11:00',
        ],
    },
    {
        'email':      'cristian.ferreira@stacktrace.com',
        'first_name': 'Cristian',
        'last_name':  'Ferreira',
        'biography':  'Triathlon coach and functional fitness specialist. Runs group and 1-on-1 programs for all fitness levels with a focus on sustainable performance gains.',
        'specialty':  'HIIT & Endurance',
        'rating':     4.7,
        'price':      50,
        'tags':       ['HIIT', 'Running', 'Functional'],
        'avatar_url': 'https://picsum.photos/seed/ferreira/200/200',
        'availability': [
            'Mon 06:00', 'Mon 07:30', 'Mon 17:00', 'Mon 18:30',
            'Wed 06:00', 'Wed 07:30', 'Wed 18:00',
            'Fri 06:30', 'Fri 08:00', 'Fri 17:30',
            'Sat 08:00', 'Sat 10:00',
        ],
    },
    {
        'email':      'amara.osei@stacktrace.com',
        'first_name': 'Amara',
        'last_name':  'Osei',
        'biography':  'National-level weightlifter and coach. Breaks down the snatch and clean & jerk into approachable progressions for athletes at every stage.',
        'specialty':  'Olympic Lifting',
        'rating':     4.9,
        'price':      80,
        'tags':       ['Olympic Lifting', 'Technique', 'Strength'],
        'avatar_url': 'https://picsum.photos/seed/osei/200/200',
        'availability': [
            'Tue 09:00', 'Tue 11:00', 'Tue 15:00',
            'Thu 09:30', 'Thu 12:00', 'Thu 16:00',
            'Sat 10:00', 'Sat 12:00',
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed the database with 5 sample coaches'

    def handle(self, *args, **options):
        password_hash = make_password('1234')
        created = 0

        for data in COACHES:
            if Coach.objects.filter(email=data['email']).exists():
                self.stdout.write(f"  skip  {data['email']} (already exists)")
                continue

            Coach.objects.create(
                email         = data['email'],
                first_name    = data['first_name'],
                last_name     = data['last_name'],
                password_hash = password_hash,
                biography     = data['biography'],
                specialty     = data['specialty'],
                rating        = data['rating'],
                price         = data['price'],
                tags          = data['tags'],
                avatar_url    = data['avatar_url'],
                availability  = data['availability'],
            )
            self.stdout.write(f"  created {data['first_name']} {data['last_name']}")
            created += 1

        self.stdout.write(self.style.SUCCESS(f'\nDone — {created} coach(es) created.'))