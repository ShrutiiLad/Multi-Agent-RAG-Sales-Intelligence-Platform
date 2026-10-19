# file_path: echo_b/echo_b/asgi.py
import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

settings_module = 'echo_b.deployment' if 'WEBSITE_HOSTNAME' in os.environ else 'echo_b.settings'


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'echo_b.settings')
django.setup()


from chat.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})

