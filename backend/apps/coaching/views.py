from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.decorators import role_required
from apps.users.models import Coach, Member
from apps.users.serializers import AssignedMemberProfileSerializer

from apps.fitness_goals.models import FitnessProfile
from apps.fitness_goals.serializers import FitnessProfileSerializer
from apps.workouts.models import WorkoutPlan, WorkoutLog
from apps.workouts.serializers import WorkoutPlanSerializer, WorkoutLogReadSerializer
from apps.nutrition.models import MealLog, NutritionPlan
from apps.nutrition.serializers import MealLogSerializer, NutritionPlanReadSerializer

from .models import CoachingSession, EquipmentReservation, ProfileAccessRequest
from .serializers import (
    CoachingSessionSerializer,
    EquipmentReservationSerializer,
    EquipmentReservationCreateSerializer,
)


class CoachingSessionBookingView(APIView):
    def get(self, request):
        member_id = request.query_params.get('member_id')
        if not member_id:
            return Response({'error': 'member_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        sessions = CoachingSession.objects.filter(member_id=member_id).order_by('-created_at')
        serializer = CoachingSessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CoachingSessionSerializer(data=request.data)
        if serializer.is_valid():
            session = serializer.save()
            return Response(CoachingSessionSerializer(session).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CoachingSessionDetailView(APIView):
    def delete(self, request, session_id):
        member_id = request.query_params.get('member_id')
        if not member_id:
            return Response({'error': 'member_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = CoachingSession.objects.select_related('coach').get(id=session_id, member_id=member_id)
        except CoachingSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        if session.status == 'canceled':
            return Response({'error': 'Session is already canceled.'}, status=status.HTTP_400_BAD_REQUEST)

        if session.status == 'rejected':
            return Response({'error': 'Rejected requests cannot be canceled.'}, status=status.HTTP_400_BAD_REQUEST)

        coach = session.coach
        availability = list(coach.availability or [])
        if session.scheduled_slot not in availability:
            availability.append(session.scheduled_slot)
            coach.availability = sorted(availability)
            coach.save(update_fields=['availability'])

        session.status = 'canceled'
        session.save(update_fields=['status'])
        return Response(CoachingSessionSerializer(session).data, status=status.HTTP_200_OK)


class ClientDetailView(APIView):
    """Return a client's data. Access is gated by ProfileAccessRequest."""

    @role_required('coach')
    def get(self, request, member_id):
        # Check the coach is actually assigned to this member
        is_client = CoachingSession.objects.filter(
            coach_id=request.user_id, member_id=member_id,
        ).exclude(status__in=['canceled', 'rejected']).exists()
        if not is_client:
            return Response({'error': 'Client not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check access request status
        try:
            access_req = ProfileAccessRequest.objects.get(
                coach_id=request.user_id, member_id=member_id,
            )
            access_status = access_req.status
            access_id     = access_req.id
        except ProfileAccessRequest.DoesNotExist:
            access_status = 'none'
            access_id     = None

        if access_status != 'accepted':
            return Response({'access': access_status, 'access_request_id': access_id})

        try:
            fp      = FitnessProfile.objects.get(member_id=member_id)
            profile = FitnessProfileSerializer(fp).data
        except FitnessProfile.DoesNotExist:
            profile = None

        plans = WorkoutPlan.objects.filter(member_id=member_id).prefetch_related('days__exercises')
        workout_logs = (
            WorkoutLog.objects
            .filter(workout_day__workout_plan__member_id=member_id)
            .select_related('workout_day', 'workout_day__workout_plan')
            .prefetch_related('sets__exercise')
            .order_by('-created_at')
        )
        nutrition_plans = NutritionPlan.objects.filter(member_id=member_id).prefetch_related('days__meals')
        nutrition_logs  = MealLog.objects.filter(member_id=member_id).order_by('-logged_at')

        return Response({
            'access':           'accepted',
            'fitness_profile':  profile,
            'workout_plans':    WorkoutPlanSerializer(plans, many=True).data,
            'workout_logs':     WorkoutLogReadSerializer(workout_logs, many=True).data,
            'nutrition_plans':  NutritionPlanReadSerializer(nutrition_plans, many=True).data,
            'nutrition_logs':   MealLogSerializer(nutrition_logs, many=True).data,
        })


class ProfileAccessRequestView(APIView):
    """
    Coach: POST to request access to a member's profile.
    Member: GET to list all incoming requests (pending + accepted).
    """

    @role_required('coach')
    def post(self, request):
        member_id = request.data.get('member_id')
        if not member_id:
            return Response({'error': 'member_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = ProfileAccessRequest.objects.get_or_create(
            coach_id=request.user_id, member_id=member_id,
            defaults={'status': ProfileAccessRequest.Status.PENDING},
        )
        if not created and obj.status == ProfileAccessRequest.Status.DECLINED:
            # Allow re-requesting after a decline
            obj.status = ProfileAccessRequest.Status.PENDING
            obj.save(update_fields=['status', 'updated_at'])

        return Response({
            'access_request_id': obj.id,
            'access':            obj.status,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @role_required('member')
    def get(self, request):
        reqs = (
            ProfileAccessRequest.objects
            .filter(member_id=request.user_id)
            .select_related('coach')
            .order_by('-created_at')
        )
        data = [
            {
                'id':         r.id,
                'coach_id':   r.coach_id,
                'coach_name': f'{r.coach.first_name} {r.coach.last_name}'.strip(),
                'specialty':  r.coach.specialty,
                'avatar_url': r.coach.avatar_url,
                'status':     r.status,
                'created_at': r.created_at,
            }
            for r in reqs
        ]
        return Response(data)


class ProfileAccessRequestDetailView(APIView):
    """
    Member: PATCH to accept/decline. DELETE to revoke.
    """

    def _get_request(self, request_id, member_id):
        return ProfileAccessRequest.objects.get(pk=request_id, member_id=member_id)

    @role_required('member')
    def patch(self, request, request_id):
        action = request.data.get('action')
        if action not in ('accept', 'decline'):
            return Response({'error': 'action must be "accept" or "decline".'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            req = self._get_request(request_id, request.user_id)
        except ProfileAccessRequest.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

        req.status = (
            ProfileAccessRequest.Status.ACCEPTED if action == 'accept'
            else ProfileAccessRequest.Status.DECLINED
        )
        req.save(update_fields=['status', 'updated_at'])
        return Response({'id': req.id, 'status': req.status})

    @role_required('member')
    def delete(self, request, request_id):
        try:
            req = self._get_request(request_id, request.user_id)
        except ProfileAccessRequest.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)
        req.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CoachingSessionRequestsView(APIView):
    """List pending (booked) sessions for the authenticated coach."""

    @role_required('coach')
    def get(self, request):
        sessions = (
            CoachingSession.objects
            .filter(coach_id=request.user_id, status='booked')
            .select_related('member')
            .order_by('scheduled_slot')
        )
        return Response(CoachingSessionSerializer(sessions, many=True).data)


class CoachingSessionRespondView(APIView):
    """Accept or reject a pending session request."""

    @role_required('coach')
    def patch(self, request, session_id):
        try:
            session = CoachingSession.objects.select_related('coach').get(
                id=session_id, coach_id=request.user_id
            )
        except CoachingSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        if session.status != 'booked':
            return Response({'error': 'Only pending sessions can be responded to.'}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get('action')
        if action not in ('accept', 'reject'):
            return Response({'error': 'action must be "accept" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'accept':
            session.status = 'accepted'

        else:
            rejection_reason = request.data.get('rejection_reason', '').strip()
            if not rejection_reason:
                return Response({'error': 'rejection_reason is required when rejecting.'}, status=status.HTTP_400_BAD_REQUEST)

            session.status           = 'rejected'
            session.rejection_reason = rejection_reason

            # Restore the slot to the coach's availability
            coach        = session.coach
            availability = list(coach.availability or [])
            if session.scheduled_slot not in availability:
                availability.append(session.scheduled_slot)
                coach.availability = sorted(availability)
                coach.save(update_fields=['availability'])

        session.save()
        return Response(CoachingSessionSerializer(session).data)


class CoachAvailabilityView(APIView):
    @role_required('coach')
    def get(self, request):
        try:
            coach = Coach.objects.get(id=request.user_id)
        except Coach.DoesNotExist:
            return Response({'error': 'Coach not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'availability': coach.availability or []})

    @role_required('coach')
    def put(self, request):
        try:
            coach = Coach.objects.get(id=request.user_id)
        except Coach.DoesNotExist:
            return Response({'error': 'Coach not found.'}, status=status.HTTP_404_NOT_FOUND)

        availability = request.data.get('availability', [])
        if not isinstance(availability, list):
            return Response({'error': 'Availability must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

        coach.availability = availability
        coach.save(update_fields=['availability'])
        return Response({'availability': coach.availability})


class CoachScheduleView(APIView):
    @role_required('coach')
    def get(self, request):
        sessions = (
            CoachingSession.objects
            .filter(coach_id=request.user_id)
            .prefetch_related('equipment_reservations__equipment__gym')
            .select_related('member')
            .exclude(status__in=['canceled', 'rejected'])
            .order_by('scheduled_slot')
        )
        return Response(CoachingSessionSerializer(sessions, many=True).data)


class AssignedMembersView(APIView):
    @role_required('coach')
    def get(self, request):
        member_ids = (
            CoachingSession.objects
            .filter(coach_id=request.user_id)
            .exclude(status__in=['canceled', 'rejected'])
            .values_list('member_id', flat=True)
            .distinct()
        )
        members = Member.objects.filter(id__in=member_ids)
        return Response(AssignedMemberProfileSerializer(members, many=True).data)


class SessionEquipmentReservationView(APIView):
    @role_required('coach')
    def post(self, request, session_id):
        try:
            session = CoachingSession.objects.get(id=session_id, coach_id=request.user_id)
        except CoachingSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = EquipmentReservationCreateSerializer(data=request.data, context={'session': session})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        reservation = serializer.save(session=session)
        return Response(EquipmentReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


class AdminEquipmentReservationTrackingView(APIView):
    @role_required('admin')
    def get(self, request):
        reservations = (
            EquipmentReservation.objects
            .filter(status=EquipmentReservation.Status.RESERVED)
            .select_related('equipment__gym', 'session__coach', 'session__member')
            .order_by('-created_at')
        )
        equipment_id = request.query_params.get('equipment_id')
        if equipment_id:
            reservations = reservations.filter(equipment_id=equipment_id)

        return Response(EquipmentReservationSerializer(reservations, many=True).data)
