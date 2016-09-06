from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def entree_stock(request):
    return render(request, 'bdc/entree_stock.html')
