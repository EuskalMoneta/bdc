from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def io_stock(request):
    return render(request, 'bdc/io-stock.html')


@login_required
def bank_deposit(request):
    return render(request, 'bdc/bank-deposit.html')


@login_required
def cash_deposit(request):
    return render(request, 'bdc/cash-deposit.html')
