import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

import requests

log = logging.getLogger(__name__)


class BDCAuthBackend:
    """ Authenticate BDC against Dolibarr through the EuskalMoneta API """

    def authenticate(self, username=None, password=None):
        user = None

        try:
            r = requests.post('%s%s' % (settings.API_PUBLIC_URL, 'verifier-mot-de-passe/?format=json'),
                              json={'id': username, 'motDePasse': password})

            log.info("r.status_code: % - r.content: %s" % (r.status_code, r.content))
            if not r.status_code == requests.codes.ok:
                log.info("Identifiant Bureau de Change ou Mot de passe invalide. Réessayez.")
                raise ValidationError("Identifiant Bureau de Change ou Mot de passe invalide. Réessayez.")
        except requests.exceptions.RequestException as e:
            log.info("BDCAuthBackend - RequestException: %s" % e)
            log.info("Identifiant Bureau de Change ou Mot de passe invalide. Réessayez.")
            raise ValidationError("Identifiant Bureau de Change ou Mot de passe invalide. Réessayez.")

        user, created = User.objects.get_or_create(username=username)
        return user

    # Required for your backend to work properly - unchanged in most scenarios
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
