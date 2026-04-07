from django.contrib import admin
from django.urls    import path, include

urlpatterns = [
    path('admin/',          admin.site.urls),
    path('api/users/',      include('apps.users.urls')),
    path('api/workouts/',   include('apps.workouts.urls')),
    path('api/coaching/',   include('apps.coaching.urls')),
    path('api/chat/',       include('apps.chat.urls')),
    path('api/faq/',        include('apps.assistant.urls')),
    path('api/gyms/',       include('apps.gym.urls')),
    path('analytics/',      include('apps.analytics.urls')),
    path('api/admin/',      include('apps.administration.urls')),
    path('api/nutrition/',  include('apps.nutrition.urls')),
    path('api/profile/',    include('apps.fitness_goals.urls')),
]
