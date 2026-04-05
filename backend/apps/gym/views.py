from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.decorators import role_required

from .models import Gym, PolicyCategory, Policy, CancellationPolicy, Equipment
from .serializers import (
    GymSerializer, GymCapacitySerializer,
    PolicyCategorySerializer, PolicySerializer, CancellationPolicySerializer,
    EquipmentAvailabilitySerializer,
    EquipmentIssueReportSerializer,
)


# ── Gyms ──────────────────────────────────────────────────────────────────────

class GymListView(APIView):
    def get(self, request):
        gyms = Gym.objects.all()
        return Response(GymSerializer(gyms, many=True).data)

    @role_required('admin')
    def post(self, request):
        serializer = GymSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_gym(gym_id):
    try:
        return Gym.objects.get(pk=gym_id)
    except Gym.DoesNotExist:
        return None

def _get_category(gym, category_id):
    try:
        return PolicyCategory.objects.get(pk=category_id, gym=gym)
    except PolicyCategory.DoesNotExist:
        return None

def _get_policy(gym, policy_id):
    try:
        return Policy.objects.get(pk=policy_id, gym=gym)
    except Policy.DoesNotExist:
        return None

def _get_cancellation_policy(gym, policy_id):
    try:
        return CancellationPolicy.objects.get(pk=policy_id, gym=gym)
    except CancellationPolicy.DoesNotExist:
        return None


class EquipmentAvailabilityListView(APIView):
    def get(self, request, gym_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)

        equipment = Equipment.objects.filter(gym=gym).prefetch_related('issues')
        category = request.query_params.get('category')
        status_filter = request.query_params.get('status')

        if category:
            equipment = equipment.filter(category__iexact=category)

        serializer = EquipmentAvailabilitySerializer(equipment, many=True)
        data = serializer.data

        if status_filter:
            data = [item for item in data if item['availability_status'] == status_filter]

        return Response(data)


class EquipmentIssueReportListView(APIView):
    @role_required('member')
    def post(self, request, equipment_id):
        try:
            equipment = Equipment.objects.get(pk=equipment_id)
        except Equipment.DoesNotExist:
            return Response({'error': 'Equipment not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = EquipmentIssueReportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(equipment=equipment, reported_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ── Gym Capacity ───────────────────────────────────────────────────────────────

class GymCapacityView(APIView):
    @role_required('admin')
    def get(self, request, gym_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(GymCapacitySerializer(gym).data)

    @role_required('admin')
    def patch(self, request, gym_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = GymCapacitySerializer(gym, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)


# ── Policy Categories ─────────────────────────────────────────────────────────

class PolicyCategoryListView(APIView):
    def get(self, request, gym_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        categories = gym.policy_categories.all()
        return Response(PolicyCategorySerializer(categories, many=True).data)

    @role_required('admin')
    def post(self, request, gym_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PolicyCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(gym=gym)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PolicyCategoryDetailView(APIView):
    @role_required('admin')
    def patch(self, request, gym_id, category_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        category = _get_category(gym, category_id)
        if not category:
            return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PolicyCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @role_required('admin')
    def delete(self, request, gym_id, category_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        category = _get_category(gym, category_id)
        if not category:
            return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Policies ──────────────────────────────────────────────────────────────────

class PolicyListView(APIView):
    def get(self, request, gym_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        policies = gym.policies.select_related('category').filter(
            cancellationpolicy__isnull=True  # exclude cancellation policies (handled separately)
        )
        return Response(PolicySerializer(policies, many=True).data)

    @role_required('admin')
    def post(self, request, gym_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PolicySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(gym=gym)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PolicyDetailView(APIView):
    def get(self, request, gym_id, policy_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        policy = _get_policy(gym, policy_id)
        if not policy:
            return Response({'error': 'Policy not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PolicySerializer(policy).data)

    @role_required('admin')
    def patch(self, request, gym_id, policy_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        policy = _get_policy(gym, policy_id)
        if not policy:
            return Response({'error': 'Policy not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PolicySerializer(policy, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @role_required('admin')
    def delete(self, request, gym_id, policy_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        policy = _get_policy(gym, policy_id)
        if not policy:
            return Response({'error': 'Policy not found.'}, status=status.HTTP_404_NOT_FOUND)
        policy.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Cancellation Policies ─────────────────────────────────────────────────────

class CancellationPolicyListView(APIView):
    def get(self, request, gym_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        policies = CancellationPolicy.objects.filter(gym=gym).select_related('category')
        return Response(CancellationPolicySerializer(policies, many=True).data)

    @role_required('admin')
    def post(self, request, gym_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CancellationPolicySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(gym=gym)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CancellationPolicyDetailView(APIView):
    def get(self, request, gym_id, policy_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        policy = _get_cancellation_policy(gym, policy_id)
        if not policy:
            return Response({'error': 'Cancellation policy not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CancellationPolicySerializer(policy).data)

    @role_required('admin')
    def patch(self, request, gym_id, policy_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        policy = _get_cancellation_policy(gym, policy_id)
        if not policy:
            return Response({'error': 'Cancellation policy not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CancellationPolicySerializer(policy, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @role_required('admin')
    def delete(self, request, gym_id, policy_id):
        gym = _get_gym(gym_id)
        if not gym:
            return Response({'error': 'Gym not found.'}, status=status.HTTP_404_NOT_FOUND)
        policy = _get_cancellation_policy(gym, policy_id)
        if not policy:
            return Response({'error': 'Cancellation policy not found.'}, status=status.HTTP_404_NOT_FOUND)
        policy.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
