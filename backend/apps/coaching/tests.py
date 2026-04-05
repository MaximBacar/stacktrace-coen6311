from django.test import TestCase
from rest_framework.test import APIClient

from apps.gym.models import Equipment, EquipmentIssue, Gym
from apps.users.models import Coach, Member

from .models import CoachingSession, EquipmentReservation


class EquipmentReservationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name='Downtown Gym')
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

    def test_coach_can_reserve_equipment_for_session(self):
        self.client.force_authenticate(user=self.coach)
        self.client.handler._force_user = self.coach
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
        self.client.force_authenticate(user=self.coach)
        self.client.handler._force_user = self.coach
        response = self.client.post(
            f'/api/coaching/sessions/{other_session.id}/equipment-reservations/',
            {'equipment': self.equipment.id, 'quantity': 2},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('quantity', response.data)
