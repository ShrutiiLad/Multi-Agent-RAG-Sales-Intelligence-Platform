from django.urls import path
from .views import BotStatView, UserListView, UserDetailView, UserCreateView, AdminStatView

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('user/create/', UserCreateView.as_view(), name='user-create'),
    path('stats/', AdminStatView.as_view(), name='admin-stats'),
    path('stats/bots/', BotStatView.as_view(), name='bot-stats'),
]