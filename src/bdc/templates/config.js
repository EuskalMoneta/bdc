var config = {};
config.getCSRFToken = '{{ csrf_token }}';
config.getAPIBaseURL = '{{ django_settings.API_PUBLIC_URL }}';
config.getLoginRedirectURL = '{{ django_settings.LOGIN_REDIRECT_URL }}';
config.getLoginURL = '{{ django_settings.LOGIN_URL }}';
config.getLogoutURL = '{{ django_settings.LOGOUT_URL }}';
window.config = config;