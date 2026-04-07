import json

from django.conf import settings

from .client import client
from .tools  import TOOLS, build_registry


SYSTEM_PROMPT: str = (
    "You are a helpful fitness club assistant. "
    "Answer questions about workouts, nutrition, scheduling, and gym policies. "
    "When a member asks about gym rules, regulations, or policies, use the get_gym_rules tool. "
    "When a member asks for a workout plan or exercise routine, use the generate_workout_plan tool "
    "to create and save a plan directly to their account. "
    "When a member asks for a meal plan, diet plan, or nutrition programme, use the generate_nutrition_plan tool "
    "to create and save a plan directly to their account. "
    "When a member asks for recipe suggestions or meal ideas, use the suggest_recipe tool "
    "to generate and save a recipe to their collection. "
    "Before generating any recipe or nutrition plan, call get_member_dietary_restrictions first "
    "and automatically apply the member's saved restrictions unless they explicitly override them. "
    "Be concise and friendly."
)


def generate_title(first_question: str) -> str:
    response = client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=[
            {"role": "user", "content": (
                f"Generate a short title (5 words max, no quotes) for a conversation "
                f"that starts with this question: {first_question}"
            )},
        ],
        max_tokens=20,
    )
    return response.choices[0].message.content.strip()


def ask(question: str, history: list[dict], member_id: int) -> str:

    # Run the agentic loop and return the assistant's final text reply.

    registry = build_registry(member_id)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history:
        role = "assistant" if msg["from_assistant"] else "user"
        messages.append({"role": role, "content": msg["content"]})
    messages.append({"role": "user", "content": question})

    for _ in range(5):  # guard against runaway loops
        response = client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )
        choice = response.choices[0]

        # No tool call -> final answer
        if not choice.message.tool_calls:
            return choice.message.content

        # Append the assistant turn that contains the tool call(s)
        messages.append(choice.message)

        # Execute every requested tool and feed results back
        for tool_call in choice.message.tool_calls:
            fn_name = tool_call.function.name
            fn_args = json.loads(tool_call.function.arguments)
            handler  = registry.get(fn_name)
            result   = handler(fn_args) if handler else json.dumps({"error": f"Unknown tool: {fn_name}"})
            messages.append({
                "role":         "tool",
                "tool_call_id": tool_call.id,
                "content":      result,
            })

    # Fallback: one final call without tools to force a text reply
    response = client.chat.completions.create(model=settings.LLM_MODEL, messages=messages)
    return response.choices[0].message.content
