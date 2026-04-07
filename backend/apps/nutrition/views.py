from collections import defaultdict
from datetime import date

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.decorators import role_required

from .models import NutritionPlan, MealDay, Meal, MealLog, Recipe
from .serializers import (
    MealSerializer, MealLogSerializer, RecipeSerializer,
    NutritionPlanReadSerializer, CreateNutritionPlanSerializer, CreateMealDaySerializer,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _owner_filter(user_id, user_role):
    return {'coach_id': user_id} if user_role == 'coach' else {'member_id': user_id}


def _get_plan(plan_id, user_id, user_role):
    return NutritionPlan.objects.get(pk=plan_id, **_owner_filter(user_id, user_role))


def _get_day(plan_id, day_id, user_id, user_role):
    f = {f'plan__{k}': v for k, v in _owner_filter(user_id, user_role).items()}
    return MealDay.objects.get(pk=day_id, plan_id=plan_id, **f)


def _get_meal(plan_id, day_id, meal_id, user_id, user_role):
    f = {f'day__plan__{k}': v for k, v in _owner_filter(user_id, user_role).items()}
    return Meal.objects.get(pk=meal_id, day_id=day_id, day__plan_id=plan_id, **f)


# ---------------------------------------------------------------------------
# Active-plan view (used by Today tab in NutritionPage)
# ---------------------------------------------------------------------------

class NutritionPlanView(APIView):
    @role_required('member')
    def get(self, request):
        empty = {'targets': {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0}, 'sections': []}

        plan = NutritionPlan.objects.filter(member_id=request.user_id, is_active=True).first()
        if not plan:
            return Response(empty)

        day = plan.days.prefetch_related('meals').first()
        if not day:
            return Response({**empty, 'targets': {
                'calories': plan.target_calories,
                'protein':  float(plan.target_protein),
                'carbs':    float(plan.target_carbs),
                'fat':      float(plan.target_fat),
            }})

        grouped = defaultdict(list)
        for meal in day.meals.all():
            grouped[meal.meal_type].append({
                'name':      meal.name,
                'calories':  meal.calories,
                'protein':   float(meal.protein),
                'carbs':     float(meal.carbs),
                'fat':       float(meal.fat),
                'recipe_id': meal.recipe_id,
            })

        order = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
        sections = [
            {'meal': meal_type, 'items': grouped[meal_type]}
            for meal_type in order
            if meal_type in grouped
        ]
        return Response({
            'targets': {
                'calories': plan.target_calories,
                'protein':  float(plan.target_protein),
                'carbs':    float(plan.target_carbs),
                'fat':      float(plan.target_fat),
            },
            'sections': sections,
        })


# ---------------------------------------------------------------------------
# Plans CRUD
# ---------------------------------------------------------------------------

class NutritionPlansView(APIView):
    @role_required('member', 'coach')
    def get(self, request):
        plans = (
            NutritionPlan.objects
            .filter(**_owner_filter(request.user_id, request.user_role))
            .prefetch_related('days__meals')
        )
        return Response(NutritionPlanReadSerializer(plans, many=True).data)

    @role_required('member', 'coach')
    def post(self, request):
        serializer = CreateNutritionPlanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        extra = {}
        if request.user_role == 'coach':
            extra['coach_id'] = request.user_id
        else:
            extra['member_id'] = request.user_id

        plan = serializer.save(**extra)
        plan.refresh_from_db()
        return Response(NutritionPlanReadSerializer(plan).data, status=status.HTTP_201_CREATED)


class NutritionPlanDetailView(APIView):
    @role_required('member', 'coach')
    def get(self, request, plan_id):
        try:
            plan = NutritionPlan.objects.prefetch_related('days__meals').get(
                pk=plan_id, **_owner_filter(request.user_id, request.user_role)
            )
        except NutritionPlan.DoesNotExist:
            return Response({'error': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(NutritionPlanReadSerializer(plan).data)

    @role_required('member', 'coach')
    def patch(self, request, plan_id):
        try:
            plan = _get_plan(plan_id, request.user_id, request.user_role)
        except NutritionPlan.DoesNotExist:
            return Response({'error': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreateNutritionPlanSerializer(plan, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        plan.refresh_from_db()
        return Response(NutritionPlanReadSerializer(plan).data)

    @role_required('member', 'coach')
    def delete(self, request, plan_id):
        try:
            plan = _get_plan(plan_id, request.user_id, request.user_role)
        except NutritionPlan.DoesNotExist:
            return Response({'error': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)
        plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NutritionPlanActivateView(APIView):
    @role_required('member')
    def post(self, request, plan_id):
        try:
            plan = NutritionPlan.objects.get(pk=plan_id, member_id=request.user_id)
        except NutritionPlan.DoesNotExist:
            return Response({'error': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)
        NutritionPlan.objects.filter(member_id=request.user_id).update(is_active=False)
        plan.is_active = True
        plan.save(update_fields=['is_active'])
        return Response({'is_active': True})


# ---------------------------------------------------------------------------
# Days CRUD
# ---------------------------------------------------------------------------

class MealDayView(APIView):
    @role_required('member', 'coach')
    def post(self, request, plan_id):
        try:
            plan = _get_plan(plan_id, request.user_id, request.user_role)
        except NutritionPlan.DoesNotExist:
            return Response({'error': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreateMealDaySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        day = serializer.save(plan=plan)
        return Response(CreateMealDaySerializer(day).data, status=status.HTTP_201_CREATED)


class MealDayDetailView(APIView):
    @role_required('member', 'coach')
    def patch(self, request, plan_id, day_id):
        try:
            day = _get_day(plan_id, day_id, request.user_id, request.user_role)
        except MealDay.DoesNotExist:
            return Response({'error': 'Day not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreateMealDaySerializer(day, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    @role_required('member', 'coach')
    def delete(self, request, plan_id, day_id):
        try:
            day = _get_day(plan_id, day_id, request.user_id, request.user_role)
        except MealDay.DoesNotExist:
            return Response({'error': 'Day not found.'}, status=status.HTTP_404_NOT_FOUND)
        day.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Meals CRUD
# ---------------------------------------------------------------------------

class MealItemView(APIView):
    @role_required('member', 'coach')
    def post(self, request, plan_id, day_id):
        try:
            day = _get_day(plan_id, day_id, request.user_id, request.user_role)
        except MealDay.DoesNotExist:
            return Response({'error': 'Day not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MealSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        meal = serializer.save(day=day)
        return Response(MealSerializer(meal).data, status=status.HTTP_201_CREATED)


class MealItemDetailView(APIView):
    @role_required('member', 'coach')
    def patch(self, request, plan_id, day_id, meal_id):
        try:
            meal = _get_meal(plan_id, day_id, meal_id, request.user_id, request.user_role)
        except Meal.DoesNotExist:
            return Response({'error': 'Meal not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MealSerializer(meal, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    @role_required('member', 'coach')
    def delete(self, request, plan_id, day_id, meal_id):
        try:
            meal = _get_meal(plan_id, day_id, meal_id, request.user_id, request.user_role)
        except Meal.DoesNotExist:
            return Response({'error': 'Meal not found.'}, status=status.HTTP_404_NOT_FOUND)
        meal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Recipes
# ---------------------------------------------------------------------------

class RecipeListView(APIView):
    @role_required('member')
    def get(self, request):
        recipes = Recipe.objects.filter(member_id=request.user_id)
        return Response(RecipeSerializer(recipes, many=True).data)


class RecipeGenerateView(APIView):
    @role_required('member')
    def post(self, request):
        from apps.assistant.agent.tools import suggest_recipe

        prompt               = request.data.get('prompt', '').strip()
        dietary_restrictions = request.data.get('dietary_restrictions', [])
        max_calories         = request.data.get('max_calories')
        min_protein          = request.data.get('min_protein')

        if not prompt:
            return Response({'error': 'prompt is required.'}, status=status.HTTP_400_BAD_REQUEST)

        result = suggest_recipe(
            member_id=request.user_id,
            prompt=prompt,
            dietary_restrictions=dietary_restrictions,
            max_calories=int(max_calories) if max_calories else None,
            min_protein=int(min_protein) if min_protein else None,
        )

        if 'error' in result:
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)

        recipe = Recipe.objects.get(pk=result['recipe_id'])
        return Response(RecipeSerializer(recipe).data, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Meal log
# ---------------------------------------------------------------------------

class MealLogView(APIView):
    @role_required('member')
    def get(self, request):
        today = date.today()
        logs = MealLog.objects.filter(member_id=request.user_id, logged_at__date=today)
        return Response(MealLogSerializer(logs, many=True).data)

    @role_required('member')
    def post(self, request):
        serializer = MealLogSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(member_id=request.user_id)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MealLogDetailView(APIView):
    @role_required('member')
    def delete(self, request, log_id):
        try:
            log = MealLog.objects.get(id=log_id, member_id=request.user_id)
        except MealLog.DoesNotExist:
            return Response({'error': 'Log entry not found.'}, status=status.HTTP_404_NOT_FOUND)
        log.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
