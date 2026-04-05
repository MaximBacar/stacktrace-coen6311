from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.decorators import role_required
from apps.users.models import Coach, Member
from apps.users.serializers import AssignedMemberProfileSerializer

from .models import CoachingSession
from .serializers import CoachingSessionSerializer


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


# === SC-76 Reports ===
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
import csv
from django.http import HttpResponse
from .models import CoachingSession

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_report(request):
    start=request.GET.get("start")
    end=request.GET.get("end")

    qs=CoachingSession.objects.all()
    if start and end:
        qs=qs.filter(scheduled_time__range=[start,end])

    total=qs.count()
    completed=qs.filter(status="completed").count()
    cancelled=qs.filter(status="cancelled").count()
    booked=qs.filter(status="pending").count()

    data={
        "total_sessions":total,
        "completed":completed,
        "cancelled":cancelled,
        "booked":booked,
        "generated_at":str(timezone.now())
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_report_csv(request):
    qs=CoachingSession.objects.all()
    response=HttpResponse(content_type='text/csv')
    response['Content-Disposition']='attachment; filename="report.csv"'
    writer=csv.writer(response)
    writer.writerow(["ID","Status","Time"])
    for s in qs:
        writer.writerow([s.id,s.status,s.scheduled_time])
    return response
