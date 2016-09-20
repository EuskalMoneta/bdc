"""
Django settings for bdc project.

Generated by 'django-admin startproject' using Django 1.9.8.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.9/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.9/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '&4q^u=5-d_k4xvgj6jz^ou8=8rh21r=*$w8dh3bnqttonmrg2k'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'members',
    'base',
    'manager',

    # 'raven.contrib.django.raven_compat',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE_CLASSES = [
    'csp.middleware.CSPMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
]

AUTHENTICATION_BACKENDS = [
    'bdc.auth.BDCAuthBackend',
]

API_PUBLIC_URL = os.environ.get('API_PUBLIC_URL')
API_PUBLIC_URL += '' if API_PUBLIC_URL.endswith('/') else '/'

API_INTERNAL_URL = os.environ.get('API_INTERNAL_URL')
API_INTERNAL_URL += '' if API_INTERNAL_URL.endswith('/') else '/'

# CSP headers
CSP_DEFAULT_SRC = ["'self'"]
CSP_FONT_SRC = ["'self'", "http://fonts.gstatic.com"]
CSP_SCRIPT_SRC = ["'self'"]
CSP_IMG_SRC = ["'self'", "data: image:"]
CSP_STYLE_SRC = ["'self'", "'unsafe-inline'", "http://fonts.googleapis.com", "data: blob:"]
CSP_CONNECT_SRC = ["'self'", API_PUBLIC_URL, "http://localhost:8001", "http://localhost:8081"]

ROOT_URLCONF = 'bdc.urls'

APPEND_SLASH = False
LOGIN_REDIRECT_URL = '/members/search'
LOGIN_URL = '/login'
LOGOUT_URL = '/logout'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(os.path.dirname(BASE_DIR), 'templates'),
                 os.path.join(os.path.dirname(BASE_DIR), 'bdc', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.i18n',
                'base.context_processors.get_django_settings',
            ],
        },
    },
]

# base.context_processors.get_django_settings needs it
TEMPLATE_VISIBLE_SETTINGS = ['LOGIN_REDIRECT_URL',
                             'LOGIN_URL', 'LOGOUT_URL',
                             'API_PUBLIC_URL']

WSGI_APPLICATION = 'bdc.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(os.path.dirname(BASE_DIR), 'db.sqlite3'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators

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


# Internationalization
# https://docs.djangoproject.com/en/1.9/topics/i18n/

TIME_ZONE = 'Europe/Paris'

USE_I18N = True

USE_L10N = True

USE_TZ = True

LANGUAGE_CODE = 'fr'

LANGUAGES = (
    ('fr', 'Francais'),
    ('eu', 'Euskara'),
)

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/

STATIC_URL = '/static/'

STATICFILES_DIRS = (
    '/assets/',
    os.path.join(os.path.dirname(BASE_DIR), 'static'),
)

# Raven + Logging
RAVEN_CONFIG = {
    'dsn': 'http://02c622eee5004e9fa9b661395e6ca409:f5b69a7e169f4bd7a716d8d8f476b3c6@sentry:9000/3',
    # If you are using git, you can also automatically configure the
    # release based on the git info.
    'release': 'dev',
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'root': {
        'level': 'DEBUG',
        'handlers': ['console'],
    },
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s '
                      '%(process)d %(thread)d %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        }
    },
}