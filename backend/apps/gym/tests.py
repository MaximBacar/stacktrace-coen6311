from django.test import TestCase
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.test import APIClient

from apps.users.models import Administrator, Member

from .models import Equipment, EquipmentIssue, Gym


class EquipmentAvailabilityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name='Downtown Gym')
        self.member = Member.objects.create(
            email='member@example.com',
            first_name='Taylor',
            last_name='Lee',
            password_hash='hashed-password',
            dob='2000-01-01',
            height=175,
        )
        self.admin = Administrator.objects.create(
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            password_hash='hashed-password',
        )
        member_token = AccessToken()
        member_token['user_id'] = self.member.id
        member_token['role'] = 'member'
        self.member_auth = f'Bearer {str(member_token)}'

        admin_token = AccessToken()
        admin_token['user_id'] = self.admin.id
        admin_token['role'] = 'admin'
        self.admin_auth = f'Bearer {str(admin_token)}'
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
                reported_by=self.member,
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

    def test_member_can_report_equipment_issue(self):
        equipment = Equipment.objects.filter(gym=self.gym).first()

        self.client.defaults['HTTP_AUTHORIZATION'] = self.member_auth
        response = self.client.post(
            f'/api/gyms/equipment/{equipment.id}/issues/',
            {'description': 'The treadmill belt keeps slipping.'},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(equipment.issues.count(), 8)
        self.assertEqual(response.data['reporter_name'], 'Taylor Lee')

    def test_admin_can_add_update_and_remove_equipment(self):
        self.client.defaults['HTTP_AUTHORIZATION'] = self.admin_auth

        create_response = self.client.post('/api/gyms/equipment/', {
            'gym': self.gym.id,
            'name': 'Bench Press',
            'category': 'Strength',
            'quantity': 3,
            'status': 'active',
            'notes': 'Near the free weights area.',
        }, format='json')

        self.assertEqual(create_response.status_code, 201)
        equipment_id = create_response.data['id']

        update_response = self.client.patch(f'/api/gyms/equipment/{equipment_id}/', {
            'quantity': 4,
            'status': 'maintenance',
        }, format='json')

        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data['quantity'], 4)
        self.assertEqual(update_response.data['status'], 'maintenance')

        delete_response = self.client.delete(f'/api/gyms/equipment/{equipment_id}/')

        self.assertEqual(delete_response.status_code, 204)

    def test_admin_can_view_and_update_equipment_issue_reports(self):
        issue = EquipmentIssue.objects.filter(equipment__gym=self.gym).first()
        self.client.defaults['HTTP_AUTHORIZATION'] = self.admin_auth

        list_response = self.client.get(f'/api/gyms/equipment-issues/?gym_id={self.gym.id}')

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 8)
        self.assertEqual(list_response.data[0]['gym_name'], 'Downtown Gym')

        update_response = self.client.patch(
            f'/api/gyms/equipment-issues/{issue.id}/',
            {'status': 'resolved'},
            format='json',
        )

        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data['status'], 'resolved')
        self.assertIsNotNone(update_response.data['resolved_at'])
