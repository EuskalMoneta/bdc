import json
import logging

from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
import requests

log = logging.getLogger()


class BDCAuthBackend(object):
    """ Authenticate BDC against Dolibarr through the EuskalMoneta API """

    def authenticate(self, username, password):
        user = None
        try:
            r = requests.post('{}{}'.format(settings.API_INTERNAL_URL, 'login/'),
                              json={'username': username, 'password': password})

            if not r.status_code == requests.codes.ok:
                log.critical('r.status_code: {} - r.content: {}'.format(r.status_code, r.content))
                log.critical('Identifiant Bureau de Change ou Mot de passe invalide.')
                raise PermissionDenied()
        except requests.exceptions.RequestException as e:
            log.critical('BDCAuthBackend - RequestException: {}'.format(e))
            log.critical('Identifiant Bureau de Change ou Mot de passe invalide. Réessayez.')
            raise PermissionDenied()

        json_response = r.json()
        try:
            # We don't need/use this token in Django:
            # But this way I make sure that the provided credentials are valid.
            # Otherwise this auth_token field is not be provided by the API.
            auth_token = json_response['auth_token']
            log.debug(auth_token)
        except KeyError:
            log.critical('Identifiant Bureau de Change ou Mot de passe invalide. Réessayez.')
            raise PermissionDenied()

        user, created = User.objects.get_or_create(username=username)
        return user

    # Required for your backend to work properly - unchanged in most scenarios
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


def login_view(request, **kwargs):
    if request.method == 'POST':
        try:
            payload = request.body.decode('utf-8')
            data = json.loads(payload)
        except (ValueError, UnicodeDecodeError):
            HttpResponseBadRequest({'error': 'Unable to decode request!'})

        username = data.get('username', '')
        password = data.get('password', '')

        if not username:
            HttpResponseBadRequest({'error': 'Username must not be empty!'})
        if not password:
            HttpResponseBadRequest({'error': 'Password must not be empty!'})

        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'connected': True})
        else:
            return JsonResponse({'connected': False})

    return render(request, 'login.html')
