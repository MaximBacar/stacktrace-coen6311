from django.test import TestCase
from rest_framework.test import APIClient

from .models import Coach


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
