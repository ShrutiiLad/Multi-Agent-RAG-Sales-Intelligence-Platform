#file_path: echo_b/chat/routing.py
from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
   re_path(r'c/(?P<thread_id>[a-fA-F0-9\-]+)/$', ChatConsumer.as_asgi()),
]
