from rest_framework import serializers
from .models import WorkoutPlan, WorkoutDay, WorkoutExercise, WorkoutLog, SetLog


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutExercise
        fields = ['id', 'name', 'sets', 'reps', 'duration', 'rest_time', 'order_index']


class WorkoutDaySerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutDay
        fields = ['id', 'day_index', 'name', 'notes', 'exercises']


class WorkoutPlanSerializer(serializers.ModelSerializer):
    days       = WorkoutDaySerializer(many=True, read_only=True)
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPlan
        fields = ['id', 'member', 'name', 'description', 'days', 'created_by']

    def get_created_by(self, obj):
        if obj.coach_id:
            return {'type': 'coach', 'name': f'{obj.coach.first_name} {obj.coach.last_name}'.strip()}
        return {'type': 'self'}


class CreateWorkoutPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutPlan
        fields = ['id', 'member', 'name', 'description']
        read_only_fields = ['member']


class CreateWorkoutDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutDay
        fields = ['id', 'day_index', 'name', 'notes']


class AddExerciseSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=255)

    class Meta:
        model = WorkoutExercise
        fields = ['id', 'name', 'sets', 'reps', 'duration', 'rest_time', 'order_index']

    def validate(self, attrs):
        if not attrs.get('reps') and not attrs.get('duration'):
            raise serializers.ValidationError('Either reps or duration must be provided.')
        return attrs


class SetLogSerializer(serializers.Serializer):
    exercise_id = serializers.IntegerField()
    weight      = serializers.DecimalField(max_digits=6, decimal_places=2)
    reps        = serializers.IntegerField(required=False, allow_null=True)
    duration    = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, attrs):
        if not attrs.get('reps') and not attrs.get('duration'):
            raise serializers.ValidationError('Either reps or duration must be provided.')
        return attrs


class WorkoutLogSerializer(serializers.Serializer):
    sets = SetLogSerializer(many=True)


class SetLogReadSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)

    class Meta:
        model = SetLog
        fields = ['id', 'exercise_name', 'weight', 'reps', 'duration']


class WorkoutLogReadSerializer(serializers.ModelSerializer):
    day_name  = serializers.CharField(source='workout_day.name',              read_only=True)
    plan_name = serializers.CharField(source='workout_day.workout_plan.name', read_only=True)
    sets      = SetLogReadSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutLog
        fields = ['id', 'created_at', 'plan_name', 'day_name', 'sets']