import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-6^uezk@dho43^^!7_tyd+vpp2jq090rn6!h9^6a325(v)a&_7(')

DEBUG = True

# ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '*').split(',')
ALLOWED_HOSTS = ALLOWED_HOSTS = ['*']

if os.environ.get('WEBSITE_HOSTNAME', '') != '':
    CSRF_TRUSTED_ORIGINS = ['https://'+os.environ['WEBSITE_HOSTNAME']]

CORS_ALLOW_ALL_ORIGINS = True

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'corsheaders',
    'authE',
    'adminE',
    'chat',
    'echo_b',
    'core',
    'support',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'authE.middleware.TokenUsageMiddleware',
]

ROOT_URLCONF = 'echo_b.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'echo_b.wsgi.application'
ASGI_APPLICATION = 'echo_b.asgi.application'


if os.getenv('AZURE_POSTGRESQL_CONNECTIONSTRING', "") is None or os.getenv('AZURE_POSTGRESQL_CONNECTIONSTRING', "") == '':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'echo_ai'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', '123456')
        }
    }
else:
    connection_string = os.environ['AZURE_POSTGRESQL_CONNECTIONSTRING']
    parameters = {pair.split('=')[0]: pair.split('=')[1] for pair in connection_string.split(' ')}

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': parameters['dbname'],
            'HOST': parameters['host'],
            'USER': parameters['user'],
            'PASSWORD': parameters['password'],
        }
    }

REDIS_HOST = os.environ.get('AZURE_REDIS_CONNECTIONSTRING', 'localhost')

AUTH_PASSWORD_VALIDATORS = []

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}



CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],  # Use your Redis host and port here
        },
    },
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'authE.EchoUser'

# VECTORSTORE = '/home/vector_store/' if os.getenv('WEBSITE_HOSTNAME', '') else BASE_DIR / 'vector_store'

# MEDIA_URL = '/home/vector_store/media/' if os.getenv('WEBSITE_HOSTNAME', '') else '/media/'
# MEDIA_ROOT = '/home/vector_store/media/' if os.getenv('WEBSITE_HOSTNAME', '') else BASE_DIR / 'media'

VECTORSTORE = BASE_DIR / 'vector_store'
MEDIA_ROOT = BASE_DIR / 'media'


STATIC_ROOT = os.path.join(BASE_DIR, 'static')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'when': 'D',
            'interval': 7,
            'backupCount': 3,
            'formatter': 'standard',
            'encoding': 'utf-8',
        },
    },
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.channels': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
