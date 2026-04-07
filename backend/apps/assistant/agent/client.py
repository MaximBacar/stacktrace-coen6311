from django.conf import settings
from openai      import OpenAI

client: OpenAI = OpenAI(api_key=settings.OPENAI_API_KEY)
