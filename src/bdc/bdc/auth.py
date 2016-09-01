import json
import logging

from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.contrib.auth import authenticate, login  # , logout
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

import requests

log = logging.getLogger()


class BDCAuthBackend(object):
    """ Authenticate BDC against Dolibarr through the EuskalMoneta API """

    def authenticate(self, username, password):
        user = None
        try:
            r = requests.post('{}{}'.format(settings.API_PUBLIC_URL, 'login/'),
                              json={'login': username, 'password': password})
            log.critical(username)
            log.critical(password)
            return {}

            log.info('r.status_code: {} - r.content: {}'.format(r.status_code, r.content))
            if not r.status_code == requests.codes.ok:
                log.info('Identifiant Bureau de Change ou Mot de passe invalide.')
                raise PermissionDenied()
        except requests.exceptions.RequestException as e:
            log.info('BDCAuthBackend - RequestException: {}'.format(e))
            log.info('Identifiant Bureau de Change ou Mot de passe invalide. Réessayez.')
            raise PermissionDenied()

        user, created = User.objects.get_or_create(username=username)
        return user

    # Required for your backend to work properly - unchanged in most scenarios
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


@csrf_exempt
def login_view(request, **kwargs):
    if request.method == 'POST':
        payload = request.body.decode(encoding='utf-8')
        data = json.loads(payload)
        username = data.get('username', '')
        password = data.get('password', '')
        log.critical('data: {}'.format(data))
        log.critical('username: ' + username)
        log.critical('password: ' + password)
        # return HttpResponse(json.dumps({'connected': True}), content_type='application/json')

        if not username:
            HttpResponseBadRequest({'error': 'Username must not be empty'})
        if not password:
            HttpResponseBadRequest({'error': 'Password must not be empty'})

        user = authenticate(username=username, password=password)
        log.critical(user)

        if user:
            login(request, user)
            return JsonResponse({'connected': True})
        else:
            return JsonResponse({'connected': False})

    return render(request, 'login.html')
