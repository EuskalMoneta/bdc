from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def index(request):
    return render(request, 'manager/index.html')


@login_required
def history(request, account_name):
    return render(request, 'manager/history.html', {'account_name': account_name})
