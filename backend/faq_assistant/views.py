from django.http import JsonResponse
from rest_framework.decorators import api_view
import google.generativeai as genai
import os # این کتابخانه برای خواندن از ویندوز لازم است

# خواندن کلید از متغیرهای محیطی ویندوز
gemini_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=gemini_key)

@api_view(['POST'])
def ask_gemini(request):
    user_question = request.data.get('question')
    
    # چک کردن اینکه آیا کلید وجود دارد یا نه
    if not gemini_key:
        return JsonResponse({'error': 'API Key not found in Windows Env'}, status=500)

    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(f"You are a fitness club assistant. Answer this: {user_question}")
    
    return JsonResponse({'reply': response.text})