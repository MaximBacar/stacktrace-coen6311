from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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
        serializer = CoachingSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)