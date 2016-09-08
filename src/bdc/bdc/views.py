from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def io_stock(request):
    return render(request, 'bdc/io-stock.html')
