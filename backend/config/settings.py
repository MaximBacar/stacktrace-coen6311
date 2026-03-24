from    datetime    import timedelta
from    pathlib     import Path

import  dj_database_url
import  os

from decouple import config

DEBUG           : bool  = config("DEBUG",           default = True, cast=bool )
SECRET_KEY      : str   = config("SECRET_KEY",      default = "django-insecure-5ps16dtn0yg)-q1)gs*ocjft=6qoe=g*708q_3_!_gpzy4ew%n")
POSTGRES_URL    : str   = config("POSTGRES_URL",    default = None)
OPENAI_API_KEY  : str   = config("OPENAI_API_KEY",  default = "")
LLM_MODEL       : str   = "gpt-4.1-nano"

BASE_DIR = Path(__file__).resolve().parent.parent

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "*.vercel.app"]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
]

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME' : timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS' : True,
}

# Uses PostgreSQL if provided, otherwise uses sqlite
DATABASES = {
    "default": dj_database_url.parse(
        os.getenv("POSTGRES_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
        conn_max_age=600,
        ssl_require=bool(os.getenv("POSTGRES_URL")),
    )
}


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'apps.users',
    'apps.workouts',
    'apps.coaching',
    'apps.chat',
    'apps.assistant',
    'apps.fitness_goals',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'apps.users.middleware.JWTAuthMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]



ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'



# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


STATIC_URL = 'static/'



