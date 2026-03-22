from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.decorators import role_required
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

        plan = serializer.save(**_owner_filter(request.user_id, request.user_role))
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
        return Response(CreateWorkoutDaySerializer(day).data)

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
        return Response(AddExerciseSerializer(exercise).data)

    @role_required('member', 'coach')
    def delete(self, request, plan_id, day_id, exercise_id):
        try:
            exercise = _get_exercise(plan_id, day_id, exercise_id, request.user_id, request.user_role)
        except WorkoutExercise.DoesNotExist:
            return Response({'error': 'Exercise not found.'}, status=status.HTTP_404_NOT_FOUND)
        exercise.delete()
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
            day = _get_day(plan_id, day_id, request.user_id)
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
