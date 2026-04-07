from rest_framework.views import APIView
from rest_framework.response import Response

from apps.users.decorators import role_required
from apps.users.models import Member, DietaryRestriction

from .models import FitnessGoal, FitnessProfile, MemberFitnessGoal
from .serializers import FitnessGoalSerializer, FitnessProfileSerializer


class FitnessGoalsListView(APIView):
    """Return all available fitness goal options."""

    @role_required('member')
    def get(self, request):
        return Response(FitnessGoalSerializer(FitnessGoal.objects.all(), many=True).data)


class FitnessProfileView(APIView):
    """GET / PUT the calling member's fitness profile."""

    @role_required('member')
    def get(self, request):
        profile, _ = FitnessProfile.objects.get_or_create(member_id=request.user_id)
        return Response(FitnessProfileSerializer(profile).data)

    @role_required('member')
    def put(self, request):
        profile, _ = FitnessProfile.objects.get_or_create(member_id=request.user_id)
        member     = Member.objects.get(pk=request.user_id)

        # Body metrics / activity level
        for field in ('height_cm', 'weight_kg', 'activity_level'):
            if field in request.data:
                val = request.data[field]
                # Allow clearing numeric fields with empty string
                if field != 'activity_level' and val == '':
                    val = None
                setattr(profile, field, val)
        profile.save()

        # Dietary restrictions (replace set)
        if 'dietary_restrictions' in request.data:
            slugs        = request.data['dietary_restrictions'] or []
            restrictions = DietaryRestriction.objects.filter(slug__in=slugs)
            member.dietary_restrictions.set(restrictions)

        # Fitness goals (replace set)
        if 'fitness_goals' in request.data:
            slugs = request.data['fitness_goals'] or []
            goals = FitnessGoal.objects.filter(slug__in=slugs)
            profile.member_goals.all().delete()
            MemberFitnessGoal.objects.bulk_create(
                [MemberFitnessGoal(profile=profile, goal=g) for g in goals],
                ignore_conflicts=True,
            )

        profile.refresh_from_db()
        return Response(FitnessProfileSerializer(profile).data)
