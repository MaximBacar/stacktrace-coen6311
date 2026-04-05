from django.test import TestCase
from rest_framework.test import APIClient

from apps.users.models import Member

from .models import Equipment, EquipmentIssue, Gym


class EquipmentAvailabilityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name='Downtown Gym')
        Member.objects.create(
            email='member@example.com',
            first_name='Taylor',
            last_name='Lee',
            password_hash='hashed-password',
            dob='2000-01-01',
            height=175,
        )
        treadmill = Equipment.objects.create(
            gym=self.gym,
            name='Treadmill',
            category='Cardio',
            quantity=12,
            status='active',
            notes='Best availability before 5 PM.',
        )
        for index in range(7):
            EquipmentIssue.objects.create(
                equipment=treadmill,
                description=f'Issue #{index + 1}',
                status='open',
            )

        Equipment.objects.create(
            gym=self.gym,
            name='Squat Rack',
            category='Strength',
            quantity=6,
            status='maintenance',
        )

    def test_member_can_view_gym_equipment_availability(self):
        response = self.client.get(f'/api/gyms/{self.gym.id}/equipment/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['gym_name'], 'Downtown Gym')
        self.assertIn('availability_status', response.data[0])

    def test_member_can_filter_equipment_by_status(self):
        response = self.client.get(f'/api/gyms/{self.gym.id}/equipment/?status=limited')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Treadmill')
