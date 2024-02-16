import logging

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils.translation import LANGUAGE_SESSION_KEY, check_for_language

log = logging.getLogger('sentry')


def config_js(request):
    """
    JavaScript config for this Django/React app.

    I use 'true' and 'false' as string on purpose!
    It will be converted in real bool objects on JavaScript-side
    """
    if request.user.is_authenticated:
        response = {'user_auth': 'true', 'username': request.user}
    else:
        response = {'user_auth': 'false', 'username': ''}

    return render(request, 'config.js', response)


def setlang_custom(request):
    """
    In this React app, I'm using fetch API to do AJAX requests, and in this particular case
    I have to use a custom i18n function because:
    - For some reason I can't make 'request.POST.get(LANGUAGE_QUERY_PARAMETER)' work with fetch
    - I need to set the 'django_language' cookie, even if I have a session.

    This code is based on set_language():
    https://github.com/django/django/blob/stable/1.10.x/django/views/i18n.py#L28
    """
    lang_code = request.GET.get('lang')
    current_page = request.META.get('HTTP_REFERER')
    log.debug(lang_code)
    log.debug(current_page)
    response = HttpResponseRedirect(current_page)
    if check_for_language(lang_code):
        # I need both session...
        request.session[LANGUAGE_SESSION_KEY] = lang_code
        # AND cookies !
        response.set_cookie(settings.LANGUAGE_COOKIE_NAME,
                            lang_code,
                            max_age=settings.LANGUAGE_COOKIE_AGE,
                            path=settings.LANGUAGE_COOKIE_PATH,
                            domain=settings.LANGUAGE_COOKIE_DOMAIN)

    return response


@login_required
def change_password(request):
    return render(request, 'change-password.html')
