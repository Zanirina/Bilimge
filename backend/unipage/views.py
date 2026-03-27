from django.shortcuts import render

# Create your views here.

def unipage(request):
    return render(request, 'main/unipage.html')