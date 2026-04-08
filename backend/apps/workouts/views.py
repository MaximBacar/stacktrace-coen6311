from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.decorators import role_required
from apps.users.models import Member
from .models import WorkoutPlan, WorkoutDay, WorkoutExercise, WorkoutLog, SetLog
from .serializers import (
    WorkoutPlanSerializer,
    CreateWorkoutPlanSerializer,
    CreateWorkoutDaySerializer,
    AddExerciseSerializer,
    WorkoutLogSerializer,
    WorkoutLogReadSerializer,
)


def _owner_filter(user_id, user_role):
    return {'coach_id': user_id} if user_role == 'coach' else {'member_id': user_id}


def _get_plan(plan_id, user_id, user_role):
    return WorkoutPlan.objects.get(pk=plan_id, **_owner_filter(user_id, user_role))


def _get_day(plan_id, day_id, user_id, user_role):
    f = {f'workout_plan__{k}': v for k, v in _owner_filter(user_id, user_role).items()}
    return WorkoutDay.objects.get(pk=day_id, workout_plan_id=plan_id, **f)


def _get_exercise(plan_id, day_id, exercise_id, user_id, user_role):
    f = {f'workout_day__workout_plan__{k}': v for k, v in _owner_filter(user_id, user_role).items()}
    return WorkoutExercise.objects.get(
        pk=exercise_id, workout_day_id=day_id,
        workout_day__workout_plan_id=plan_id,
        **f,
    )


class WorkoutPlanView(APIView):
    @role_required('member', 'coach')
    def get(self, request):
        plans = WorkoutPlan.objects.filter(**_owner_filter(request.user_id, request.user_role)).prefetch_related('days__exercises')
        return Response(WorkoutPlanSerializer(plans, many=True).data)

  
    @role_required('member', 'coach')
    @transaction.atomic
    def post(self, request):
        serializer = CreateWorkoutPlanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        extra_data = {}
        if request.user_role == 'coach':
            extra_data['coach_id'] = request.user_id
        else:
            extra_data['member_id'] = request.user_id

        plan = serializer.save(**extra_data)
        WorkoutDay.objects.create(workout_plan=plan, day_index=1, name='Day A')
        return Response(WorkoutPlanSerializer(plan).data, status=status.HTTP_201_CREATED)


class WorkoutPlanDetailView(APIView):
    @role_required('member', 'coach')
    def get(self, request, plan_id):
        try:
            plan = WorkoutPlan.objects.prefetch_related('days__exercises').get(
                pk=plan_id, **_owner_filter(request.user_id, request.user_role)
            )
        except WorkoutPlan.DoesNotExist:
            return Response({'error': 'Workout plan not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(WorkoutPlanSerializer(plan).data)

    @role_required('member', 'coach')
    def patch(self, request, plan_id):
        try:
            plan = _get_plan(plan_id, request.user_id, request.user_role)
        except WorkoutPlan.DoesNotExist:
            return Response({'error': 'Workout plan not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreateWorkoutPlanSerializer(plan, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        plan.refresh_from_db()
        return Response(WorkoutPlanSerializer(plan).data)

    @role_required('member', 'coach')
    def delete(self, request, plan_id):
        try:
            plan = _get_plan(plan_id, request.user_id, request.user_role)
        except WorkoutPlan.DoesNotExist:
            return Response({'error': 'Workout plan not found.'}, status=status.HTTP_404_NOT_FOUND)
        plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WorkoutDayView(APIView):
    @role_required('member', 'coach')
    def post(self, request, plan_id):
        try:
            plan = _get_plan(plan_id, request.user_id, request.user_role)
        except WorkoutPlan.DoesNotExist:
            return Response({'error': 'Workout plan not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreateWorkoutDaySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        day = serializer.save(workout_plan=plan)
        return Response(CreateWorkoutDaySerializer(day).data, status=status.HTTP_201_CREATED)


class WorkoutDayDetailView(APIView):
    @role_required('member', 'coach')
    def patch(self, request, plan_id, day_id):
        try:
            day = _get_day(plan_id, day_id, request.user_id, request.user_role)
        except WorkoutDay.DoesNotExist:
            return Response({'error': 'Workout day not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreateWorkoutDaySerializer(day, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    @role_required('member', 'coach')
    def delete(self, request, plan_id, day_id):
        try:
            day = _get_day(plan_id, day_id, request.user_id, request.user_role)
        except WorkoutDay.DoesNotExist:
            return Response({'error': 'Workout day not found.'}, status=status.HTTP_404_NOT_FOUND)
        day.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WorkoutExerciseView(APIView):
    @role_required('member', 'coach')
    def post(self, request, plan_id, day_id):
        try:
            day = _get_day(plan_id, day_id, request.user_id, request.user_role)
        except WorkoutDay.DoesNotExist:
            return Response({'error': 'Workout day not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddExerciseSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        exercise = serializer.save(workout_day=day)
        return Response(AddExerciseSerializer(exercise).data, status=status.HTTP_201_CREATED)


class WorkoutExerciseDetailView(APIView):
    @role_required('member', 'coach')
    def patch(self, request, plan_id, day_id, exercise_id):
        try:
            exercise = _get_exercise(plan_id, day_id, exercise_id, request.user_id, request.user_role)
        except WorkoutExercise.DoesNotExist:
            return Response({'error': 'Exercise not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddExerciseSerializer(exercise, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    @role_required('member', 'coach')
    def delete(self, request, plan_id, day_id, exercise_id):
        try:
            exercise = _get_exercise(plan_id, day_id, exercise_id, request.user_id, request.user_role)
        except WorkoutExercise.DoesNotExist:
            return Response({'error': 'Exercise not found.'}, status=status.HTTP_404_NOT_FOUND)
        exercise.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WorkoutPlanAssignView(APIView):
    """
    GET  — list members this template plan has been assigned to.
    POST — assign (deep-copy) this template to a member.
    """

    @role_required('coach')
    def get(self, request, plan_id):
        try:
            WorkoutPlan.objects.get(pk=plan_id, coach_id=request.user_id, source_plan__isnull=True)
        except WorkoutPlan.DoesNotExist:
            return Response({'error': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)

        assignments = (
            WorkoutPlan.objects
            .filter(source_plan_id=plan_id, coach_id=request.user_id)
            .select_related('member')
        )
        data = [
            {
                'assignment_plan_id': a.id,
                'member_id':    a.member_id,
                'member_name':  f'{a.member.first_name} {a.member.last_name}'.strip(),
                'member_email': a.member.email,
            }
            for a in assignments
        ]
        return Response(data)

    @role_required('coach')
    @transaction.atomic
    def post(self, request, plan_id):
        try:
            template = WorkoutPlan.objects.prefetch_related('days__exercises').get(
                pk=plan_id, coach_id=request.user_id, source_plan__isnull=True,
            )
        except WorkoutPlan.DoesNotExist:
            return Response({'error': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)

        member_id = request.data.get('member_id')
        if not member_id:
            return Response({'error': 'member_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify the member is a client of this coach
        from apps.coaching.models import CoachingSession
        is_client = CoachingSession.objects.filter(
            coach_id=request.user_id, member_id=member_id,
        ).exclude(status__in=['canceled', 'rejected']).exists()
        if not is_client:
            return Response({'error': 'Member is not one of your clients.'}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent duplicate assignment
        if WorkoutPlan.objects.filter(source_plan=template, member_id=member_id).exists():
            return Response({'error': 'Plan already assigned to this member.'}, status=status.HTTP_400_BAD_REQUEST)

        # Deep-copy template → member
        copy = WorkoutPlan.objects.create(
            member_id=member_id,
            coach_id=request.user_id,
            source_plan=template,
            name=template.name,
            description=template.description,
        )
        for day in template.days.all():
            new_day = WorkoutDay.objects.create(
                workout_plan=copy,
                day_index=day.day_index,
                name=day.name,
                notes=day.notes,
            )
            WorkoutExercise.objects.bulk_create([
                WorkoutExercise(
                    workout_day=new_day,
                    name=ex.name,
                    sets=ex.sets,
                    reps=ex.reps,
                    duration=ex.duration,
                    rest_time=ex.rest_time,
                    order_index=ex.order_index,
                )
                for ex in day.exercises.all()
            ])

        member = Member.objects.get(pk=member_id)
        return Response({
            'assignment_plan_id': copy.id,
            'member_id':    member.id,
            'member_name':  f'{member.first_name} {member.last_name}'.strip(),
            'member_email': member.email,
        }, status=status.HTTP_201_CREATED)


class WorkoutPlanUnassignView(APIView):
    """DELETE — remove a member's assigned copy of a template."""

    @role_required('coach')
    def delete(self, request, plan_id, member_id):
        try:
            assignment = WorkoutPlan.objects.get(
                source_plan_id=plan_id, member_id=member_id, coach_id=request.user_id,
            )
        except WorkoutPlan.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)
        assignment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WorkoutLogsListView(APIView):
    @role_required('member')
    def get(self, request):
        logs = (
            WorkoutLog.objects
            .filter(workout_day__workout_plan__member_id=request.user_id)
            .select_related('workout_day', 'workout_day__workout_plan')
            .prefetch_related('sets__exercise')
            .order_by('-created_at')
        )
        return Response(WorkoutLogReadSerializer(logs, many=True).data)


class WorkoutLogView(APIView):
    @role_required('member')
    @transaction.atomic
    def post(self, request, plan_id, day_id):
        try:
            day = _get_day(plan_id, day_id, request.user_id, 'member')
        except WorkoutDay.DoesNotExist:
            return Response({'error': 'Workout day not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = WorkoutLogSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        exercise_ids = {s['exercise_id'] for s in serializer.validated_data['sets']}
        valid_ids = set(
            WorkoutExercise.objects.filter(pk__in=exercise_ids, workout_day=day)
            .values_list('pk', flat=True)
        )
        invalid = exercise_ids - valid_ids
        if invalid:
            return Response({'error': f'Invalid exercise ids: {invalid}'}, status=status.HTTP_400_BAD_REQUEST)

        log = WorkoutLog.objects.create(workout_day=day)
        SetLog.objects.bulk_create([
            SetLog(
                workout_log=log,
                exercise_id=s['exercise_id'],
                weight=s['weight'],
                reps=s.get('reps'),
                duration=s.get('duration'),
            )
            for s in serializer.validated_data['sets']
        ])
        return Response({'id': log.pk, 'created_at': log.created_at}, status=status.HTTP_201_CREATED)
