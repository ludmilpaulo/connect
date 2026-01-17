from django.urls import path
from .views import register, login, me, refresh_token

urlpatterns = [
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/me/', me, name='me'),
    path('auth/refresh/', refresh_token, name='refresh-token'),
]
