
from django.contrib import admin
from django.urls import path, include
from unipage.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main.urls')),
    path('unipage/', include('unipage.urls')),
    path('api/auth/', include('userpage.urls')),
    path('api/chat/', include('chatbot.urls')),
    path('api/announcements/', include('announcements.urls')),
    path('api/calendar/', include('calendar_app.urls')),
]
