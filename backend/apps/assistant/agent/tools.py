import json

from pydantic        import BaseModel, Field
from django.conf     import settings

from apps.gym.models       import CancellationPolicy, Gym, Policy
from apps.nutrition.models import MealDay, Meal, NutritionPlan, Recipe, DIETARY_VALUES
from apps.users.models     import Member, MemberDietaryRestriction
from apps.workouts.models  import WorkoutDay, WorkoutExercise, WorkoutPlan


# ---------------------------------------------------------------------------
# Pydantic schemas — define the exact shape the LLM must return
# ---------------------------------------------------------------------------

class ExerciseSchema(BaseModel):
    name:        str       = Field(description="Exercise name")
    sets:        int       = Field(description="Number of sets", ge=1)
    reps:        int | None = Field(None, description="Reps per set — null for duration-based exercises")
    duration:    int | None = Field(None, description="Duration in seconds per set — null for rep-based exercises")
    rest_time:   int       = Field(description="Rest between sets in seconds", ge=0)
    order_index: int       = Field(description="Position of this exercise within the day, starting at 1")


class DaySchema(BaseModel):
    day_index:  int                  = Field(description="Day number, starting at 1")
    name:       str                  = Field(description="Day label, e.g. 'Upper Body', 'Rest Day'")
    notes:      str                  = Field("", description="Optional coaching notes for this day")
    exercises:  list[ExerciseSchema] = Field(description="Exercises for this day — empty list for rest days")


class WorkoutPlanSchema(BaseModel):
    name:        str            = Field(description="Plan name")
    description: str            = Field(description="Brief description of the plan's goals and structure")
    days:        list[DaySchema] = Field(description="All days in the plan, one entry per day")


# Recipe
class RecipeSchema(BaseModel):
    name:                 str        = Field(description="Recipe name")
    description:          str        = Field(description="Brief description of the dish")
    ingredients:          list[str]  = Field(description="Ingredients with quantities, e.g. '200 g chicken breast'")
    steps:                list[str]  = Field(description="Step-by-step cooking instructions")
    dietary_restrictions: list[str]  = Field(default=[], description="Applicable dietary labels from the allowed list")
    calories:             int        = Field(description="Calories per serving", ge=0)
    protein:              float      = Field(description="Protein in grams per serving", ge=0)
    carbs:                float      = Field(description="Carbohydrates in grams per serving", ge=0)
    fat:                  float      = Field(description="Fat in grams per serving", ge=0)
    prep_time:            str        = Field(description="Preparation time, e.g. '25 min'")
    tags:                 list[str]  = Field(default=[], description="Short descriptive tags, e.g. 'Quick', 'High protein'")


# Nutrition plan
MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

class MealItemSchema(BaseModel):
    meal_type: str   = Field(description=f"Meal slot — one of: {MEAL_TYPES}")
    name:      str   = Field(description="Dish name, e.g. 'Grilled chicken salad'")
    calories:  int   = Field(description="Calories for this meal", ge=0)
    protein:   float = Field(description="Protein in grams", ge=0)
    carbs:     float = Field(description="Carbohydrates in grams", ge=0)
    fat:       float = Field(description="Fat in grams", ge=0)


class NutritionDaySchema(BaseModel):
    name:   str                  = Field(description="Day label, e.g. 'Day 1' or 'Monday'")
    order:  int                  = Field(description="Position of this day in the plan, starting at 1")
    meals:  list[MealItemSchema] = Field(description="All meals for this day")


class NutritionPlanSchema(BaseModel):
    name:             str                    = Field(description="Plan name")
    target_calories:  int                    = Field(description="Daily calorie target", ge=0)
    target_protein:   float                  = Field(description="Daily protein target in grams", ge=0)
    target_carbs:     float                  = Field(description="Daily carbohydrate target in grams", ge=0)
    target_fat:       float                  = Field(description="Daily fat target in grams", ge=0)
    days:             list[NutritionDaySchema] = Field(description="All days in the plan")


# ---------------------------------------------------------------------------
# Tool schemas (OpenAI function-calling definitions)
# ---------------------------------------------------------------------------

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_gym_rules",
            "description": (
                "Retrieve the gym's rules, policies, and cancellation policies. "
                "Use this whenever a member asks about what is or isn't allowed, "
                "gym regulations, opening rules, or cancellation terms."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "gym_id": {
                        "type": "integer",
                        "description": "ID of a specific gym. Omit to retrieve rules for all gyms.",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_member_dietary_restrictions",
            "description": (
                "Retrieve the dietary restrictions saved on the member's profile. "
                "Use this before generating a recipe or nutrition plan so the output respects the member's preferences."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "suggest_recipe",
            "description": (
                "Generate a personalised recipe and save it to the member's recipe collection. "
                "Use when a member asks for recipe suggestions, meal ideas, or what to cook."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "Free-text description of the desired recipe, e.g. 'quick high-protein breakfast'.",
                    },
                    "dietary_restrictions": {
                        "type": "array",
                        "items": {"type": "string", "enum": DIETARY_VALUES},
                        "description": "Dietary restrictions or preferences to respect.",
                    },
                    "max_calories": {
                        "type": "integer",
                        "description": "Maximum calories per serving.",
                    },
                    "min_protein": {
                        "type": "integer",
                        "description": "Minimum protein in grams per serving.",
                    },
                },
                "required": ["prompt"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_nutrition_plan",
            "description": (
                "Generate a personalised nutrition plan and save it directly to the member's account. "
                "Use when a member asks for a meal plan, diet plan, or nutrition programme."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "goal": {
                        "type": "string",
                        "description": "Nutrition goal, e.g. 'weight loss', 'muscle gain', 'maintenance', 'improve energy'.",
                    },
                    "days": {
                        "type": "integer",
                        "description": "Number of days to plan (1–7).",
                        "minimum": 1,
                        "maximum": 7,
                    },
                    "target_calories": {
                        "type": "integer",
                        "description": "Optional daily calorie target. Inferred from goal if omitted.",
                    },
                    "dietary_restrictions": {
                        "type": "array",
                        "items": {"type": "string", "enum": DIETARY_VALUES},
                        "description": "Dietary restrictions or preferences to respect.",
                    },
                },
                "required": ["goal", "days"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_workout_plan",
            "description": (
                "Generate a personalised workout plan and save it directly to the member's account. "
                "Use this when a member asks for a workout plan, exercise routine, or training program."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "goal": {
                        "type": "string",
                        "description": "Fitness goal, e.g. 'weight loss', 'muscle building', 'improve endurance'.",
                    },
                    "days_per_week": {
                        "type": "integer",
                        "description": "Number of training days per week (1–7).",
                        "minimum": 1,
                        "maximum": 7,
                    },
                    "difficulty": {
                        "type": "string",
                        "enum": ["beginner", "intermediate", "advanced"],
                        "description": "Experience level of the member.",
                    },
                    "focus_areas": {
                        "type": "string",
                        "description": "Optional. Specific muscle groups or areas, e.g. 'upper body', 'legs and glutes'.",
                    },
                },
                "required": ["goal", "days_per_week", "difficulty"],
            },
        },
    },
]


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

def get_gym_rules(gym_id: int | None = None) -> str:
    gyms = Gym.objects.all() if gym_id is None else Gym.objects.filter(pk=gym_id)

    if not gyms.exists():
        return json.dumps({"error": "No gym found."})

    result = []
    for gym in gyms:
        policies_by_category: dict[str, list] = {}
        for policy in Policy.objects.filter(gym=gym).select_related('category'):
            cat = policy.category.name if policy.category else "General"
            policies_by_category.setdefault(cat, []).append({
                "title":   policy.title,
                "content": policy.content,
            })

        cancellation_policies = [
            {
                "title":          cp.title,
                "content":        cp.content,
                "penalty_type":   cp.penalty_type,
                "penalty_amount": str(cp.penalty_amount),
                "notice_hours":   cp.notice_hours,
            }
            for cp in CancellationPolicy.objects.filter(gym=gym)
        ]

        result.append({
            "gym_id":                gym.id,
            "gym_name":              gym.name,
            "policies":              policies_by_category,
            "cancellation_policies": cancellation_policies,
        })

    return json.dumps(result)


def get_member_dietary_restrictions(member_id: int) -> str:
    restrictions = (
        MemberDietaryRestriction.objects
        .filter(member_id=member_id)
        .select_related('restriction')
        .values_list('restriction__name', 'restriction__slug')
    )

    if not restrictions:
        return json.dumps({"dietary_restrictions": [], "message": "No dietary restrictions saved on this profile."})

    return json.dumps({
        "dietary_restrictions": [
            {"name": name, "slug": slug} for name, slug in restrictions
        ],
    })


def suggest_recipe(
    member_id:            int,
    prompt:               str,
    dietary_restrictions: list[str] = None,
    max_calories:         int | None = None,
    min_protein:          int | None = None,
) -> dict:
    from .client import client

    try:
        member = Member.objects.get(pk=member_id)
    except Member.DoesNotExist:
        return {"error": "Member not found."}

    dietary_restrictions = dietary_restrictions or []

    constraints = []
    if dietary_restrictions:
        constraints.append(f"Dietary restrictions: {', '.join(dietary_restrictions)}.")
    if max_calories:
        constraints.append(f"Maximum {max_calories} calories per serving.")
    if min_protein:
        constraints.append(f"At least {min_protein} g protein per serving.")

    user_message = prompt
    if constraints:
        user_message += " Constraints: " + " ".join(constraints)

    response = client.beta.chat.completions.parse(
        model=settings.LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert nutritionist and chef. "
                    "Generate detailed, delicious, and healthy recipes. "
                    f"Only use dietary restriction labels from this list: {DIETARY_VALUES}."
                ),
            },
            {"role": "user", "content": user_message},
        ],
        response_format=RecipeSchema,
    )

    data: RecipeSchema = response.choices[0].message.parsed

    recipe = Recipe.objects.create(
        member=member,
        name=data.name,
        description=data.description,
        ingredients=data.ingredients,
        steps=data.steps,
        dietary_restrictions=data.dietary_restrictions,
        calories=data.calories,
        protein=data.protein,
        carbs=data.carbs,
        fat=data.fat,
        prep_time=data.prep_time,
        tags=data.tags,
        prompt=prompt,
    )

    return {"recipe_id": recipe.id, "recipe_name": recipe.name}


def generate_nutrition_plan(
    member_id:            int,
    goal:                 str,
    days:                 int,
    target_calories:      int | None = None,
    dietary_restrictions: list[str]  = None,
) -> str:
    from .client import client

    try:
        member = Member.objects.get(pk=member_id)
    except Member.DoesNotExist:
        return json.dumps({"error": "Member not found."})

    dietary_restrictions = dietary_restrictions or []

    prompt_parts = [
        f"Create a {days}-day nutrition plan.",
        f"Goal: {goal}.",
    ]
    if target_calories:
        prompt_parts.append(f"Target approximately {target_calories} calories per day.")
    if dietary_restrictions:
        prompt_parts.append(f"Dietary restrictions: {', '.join(dietary_restrictions)}.")
    prompt_parts.append(
        f"Each day must include meals from these slots: {MEAL_TYPES}. "
        "Provide realistic dish names with accurate macros."
    )

    response = client.beta.chat.completions.parse(
        model=settings.LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert registered dietitian. "
                    "Generate detailed, balanced, and practical nutrition plans. "
                    f"Only use these meal types: {MEAL_TYPES}. "
                    "Ensure daily macro totals are consistent with the calorie target."
                ),
            },
            {"role": "user", "content": " ".join(prompt_parts)},
        ],
        response_format=NutritionPlanSchema,
    )

    plan_data: NutritionPlanSchema = response.choices[0].message.parsed

    plan = NutritionPlan.objects.create(
        member=member,
        name=plan_data.name,
        target_calories=plan_data.target_calories,
        target_protein=plan_data.target_protein,
        target_carbs=plan_data.target_carbs,
        target_fat=plan_data.target_fat,
    )

    for day_data in plan_data.days:
        day = MealDay.objects.create(
            plan=plan,
            name=day_data.name,
            order=day_data.order,
        )
        for meal_data in day_data.meals:
            Meal.objects.create(
                day=day,
                meal_type=meal_data.meal_type,
                name=meal_data.name,
                calories=meal_data.calories,
                protein=meal_data.protein,
                carbs=meal_data.carbs,
                fat=meal_data.fat,
            )

    return json.dumps({
        "success":   True,
        "plan_id":   plan.id,
        "plan_name": plan.name,
        "days":      len(plan_data.days),
        "message":   f"Nutrition plan '{plan.name}' has been created and saved to your account.",
    })


def generate_workout_plan(
    member_id:    int,
    goal:         str,
    days_per_week: int,
    difficulty:   str,
    focus_areas:  str = "",
) -> str:
    from .client import client  # imported here to avoid module-level circular dependency

    try:
        member = Member.objects.get(pk=member_id)
    except Member.DoesNotExist:
        return json.dumps({"error": "Member not found."})

    prompt_parts = [
        f"Create a {difficulty} workout plan for {days_per_week} training days per week.",
        f"Goal: {goal}.",
    ]
    if focus_areas:
        prompt_parts.append(f"Focus areas: {focus_areas}.")
    prompt_parts.append(
        "Include specific exercises with sets, reps or duration, and rest times. "
        "Add rest days where appropriate."
    )

    response = client.beta.chat.completions.parse(
        model=settings.LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert personal trainer. "
                    "Generate detailed, safe, and effective workout plans. "
                    "Every exercise must have either reps or duration (not both, not neither)."
                ),
            },
            {"role": "user", "content": " ".join(prompt_parts)},
        ],
        response_format=WorkoutPlanSchema,
    )

    plan_data: WorkoutPlanSchema = response.choices[0].message.parsed

    # Persist to DB
    plan = WorkoutPlan.objects.create(
        member=member,
        name=plan_data.name,
        description=plan_data.description,
    )

    for day_data in plan_data.days:
        day = WorkoutDay.objects.create(
            workout_plan=plan,
            day_index=day_data.day_index,
            name=day_data.name,
            notes=day_data.notes,
        )
        for ex in day_data.exercises:
            WorkoutExercise.objects.create(
                workout_day=day,
                name=ex.name,
                sets=ex.sets,
                reps=ex.reps,
                duration=ex.duration,
                rest_time=ex.rest_time,
                order_index=ex.order_index,
            )

    return json.dumps({
        "success":   True,
        "plan_id":   plan.id,
        "plan_name": plan.name,
        "days":      len(plan_data.days),
        "message":   f"Workout plan '{plan.name}' has been created and saved to your account.",
    })


# ---------------------------------------------------------------------------
# Registry builder — member_id is injected per-request so tools can save to DB
# ---------------------------------------------------------------------------

def build_registry(member_id: int) -> dict[str, callable]:
    return {
        "get_gym_rules": lambda args: get_gym_rules(
            gym_id=args.get("gym_id"),
        ),
        "get_member_dietary_restrictions": lambda args: get_member_dietary_restrictions(
            member_id=member_id,
        ),
        "suggest_recipe": lambda args: json.dumps(suggest_recipe(
            member_id=member_id,
            prompt=args["prompt"],
            dietary_restrictions=args.get("dietary_restrictions", []),
            max_calories=args.get("max_calories"),
            min_protein=args.get("min_protein"),
        )),
        "generate_nutrition_plan": lambda args: generate_nutrition_plan(
            member_id=member_id,
            goal=args["goal"],
            days=args["days"],
            target_calories=args.get("target_calories"),
            dietary_restrictions=args.get("dietary_restrictions", []),
        ),
        "generate_workout_plan": lambda args: generate_workout_plan(
            member_id=member_id,
            goal=args["goal"],
            days_per_week=args["days_per_week"],
            difficulty=args.get("difficulty", "intermediate"),
            focus_areas=args.get("focus_areas", ""),
        ),
    }
