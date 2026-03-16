from django.test import TestCase
from rest_framework.test import APIClient

from .models import Coach, Member, CoachingSession


class CoachDirectoryTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_returns_coaches_with_availability(self):
        Coach.objects.create(
            email='coach@example.com',
            first_name='Casey',
            last_name='Jordan',
            password_hash='hashed-password',
            biography='Strength coach focused on sustainable routines.',
            availability=['Mon 6:00 PM', 'Wed 7:30 AM'],
        )

        response = self.client.get('/api/users/coaches/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['full_name'], 'Casey Jordan')
        self.assertEqual(response.data[0]['availability'], ['Mon 6:00 PM', 'Wed 7:30 AM'])


class CoachingSessionBookingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.member = Member.objects.create(
            email='member@example.com',
            first_name='Taylor',
            last_name='Lee',
            password_hash='hashed-password',
            dob='2000-01-01',
            height=175,
        )
        self.coach = Coach.objects.create(
            email='coach@example.com',
            first_name='Casey',
            last_name='Jordan',
            password_hash='hashed-password',
            biography='Strength coach focused on sustainable routines.',
            availability=['Mon 6:00 PM', 'Wed 7:30 AM'],
        )

    def test_member_can_book_available_session(self):
        response = self.client.post('/api/users/coaching-sessions/', {
            'member_id': self.member.id,
            'coach_id': self.coach.id,
            'scheduled_slot': 'Mon 6:00 PM',
            'goals': 'Build a four-week strength plan.',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(CoachingSession.objects.count(), 1)

        self.coach.refresh_from_db()
        self.assertEqual(self.coach.availability, ['Wed 7:30 AM'])

    def test_booking_rejects_unavailable_slot(self):
        response = self.client.post('/api/users/coaching-sessions/', {
            'member_id': self.member.id,
            'coach_id': self.coach.id,
            'scheduled_slot': 'Fri 9:00 AM',
            'goals': 'Improve sprint form.',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('scheduled_slot', response.data)
