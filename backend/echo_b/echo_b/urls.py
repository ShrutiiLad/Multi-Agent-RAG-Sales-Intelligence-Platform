from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from core.views import index

urlpatterns = [
    path("", index, name="index"),
    path("admin/", admin.site.urls),
    path("auth/", include("authE.urls")),
    path("api/", include([
        path("admin/", include("adminE.urls")),
        path("support/", include("support.urls")),
        path("chat/", include("chat.urls")),
        path("core/", include("core.urls")),
    ])),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
