from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def index(request):
    return render(request, 'manager/index.html')


@login_required
def history(request, account_name):
    return render(request, 'manager/history.html', {'account_name': account_name})


@login_required
def entree_stock(request):
    return render(request, 'manager/entree-stock.html')


@login_required
def sortie_stock(request):
    return render(request, 'manager/sortie-stock.html')


@login_required
def bank_deposit(request):
    return render(request, 'manager/bank-deposit.html')


@login_required
def cash_deposit(request):
    return render(request, 'manager/cash-deposit.html')
