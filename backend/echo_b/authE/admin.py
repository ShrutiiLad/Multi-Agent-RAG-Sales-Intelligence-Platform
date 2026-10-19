from django.contrib import admin
from .models import EchoUser, Profile
# Register your models here.
admin.site.register(Profile)
admin.site.register(EchoUser)
