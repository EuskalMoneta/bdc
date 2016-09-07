from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def index(request, member_id):
    return render(request, 'members/show.html', {'member_id': member_id})


@login_required
def add(request):
    return render(request, 'members/add.html')


@login_required
def search(request):
    return render(request, 'members/search.html')


@login_required
def add_subscription(request, member_id):
    return render(request, 'members/add_subscription.html', {'member_id': member_id})


@login_required
def change_euro_eusko(request, member_id):
    return render(request, 'members/change_euro_eusko.html', {'member_id': member_id})
