from django.test import TestCase
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.test import APIClient

from apps.gym.models import Equipment, EquipmentIssue, Gym
from apps.users.models import Administrator, Coach, Member

from .models import CoachingSession, EquipmentReservation


class EquipmentReservationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name='Downtown Gym')
        self.admin = Administrator.objects.create(
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            password_hash='hashed-password',
        )
        self.coach = Coach.objects.create(
            email='coach@example.com',
            first_name='Casey',
            last_name='Jordan',
            password_hash='hashed-password',
            biography='Strength coach.',
            availability=['Mon 6:00 PM'],
        )
        self.member = Member.objects.create(
            email='member@example.com',
            first_name='Taylor',
            last_name='Lee',
            password_hash='hashed-password',
            dob='2000-01-01',
            height=175,
        )
        self.session = CoachingSession.objects.create(
            member=self.member,
            coach=self.coach,
            scheduled_slot='Mon 6:00 PM',
            goals='Lower body strength',
            status='accepted',
        )
        self.equipment = Equipment.objects.create(
            gym=self.gym,
            name='Squat Rack',
            category='Strength',
            quantity=4,
            status='active',
        )
        EquipmentIssue.objects.create(
            equipment=self.equipment,
            reported_by=self.member,
            description='One rack is out of service.',
            status='open',
        )
        coach_token = AccessToken()
        coach_token['user_id'] = self.coach.id
        coach_token['role'] = 'coach'
        self.coach_auth = f'Bearer {str(coach_token)}'

        admin_token = AccessToken()
        admin_token['user_id'] = self.admin.id
        admin_token['role'] = 'admin'
        self.admin_auth = f'Bearer {str(admin_token)}'

    def test_coach_can_reserve_equipment_for_session(self):
        self.client.defaults['HTTP_AUTHORIZATION'] = self.coach_auth
        response = self.client.post(
            f'/api/coaching/sessions/{self.session.id}/equipment-reservations/',
            {'equipment': self.equipment.id, 'quantity': 2},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(EquipmentReservation.objects.count(), 1)
        self.assertEqual(response.data['equipment_name'], 'Squat Rack')

    def test_reservation_rejects_when_not_enough_units_available(self):
        EquipmentReservation.objects.create(session=self.session, equipment=self.equipment, quantity=2)
        other_session = CoachingSession.objects.create(
            member=self.member,
            coach=self.coach,
            scheduled_slot='Tue 6:00 PM',
            goals='Mobility',
            status='accepted',
        )
        self.client.defaults['HTTP_AUTHORIZATION'] = self.coach_auth
        response = self.client.post(
            f'/api/coaching/sessions/{other_session.id}/equipment-reservations/',
            {'equipment': self.equipment.id, 'quantity': 2},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('quantity', response.data)

    def test_admin_can_track_active_equipment_reservations(self):
        EquipmentReservation.objects.create(session=self.session, equipment=self.equipment, quantity=2)
        self.client.defaults['HTTP_AUTHORIZATION'] = self.admin_auth

        response = self.client.get('/api/coaching/equipment-reservations/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['equipment_name'], 'Squat Rack')
