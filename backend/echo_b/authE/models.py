from django.db import models
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.models import AbstractUser
from rest_framework.authtoken.models import Token
import uuid
from django.conf import settings

# change the avatar name to user id

class EchoUser(AbstractUser,PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    def __str__(self):
        return self.username
    
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='users/avatars/', null=True, blank=True)

    def __str__(self):
        return self.user.username

class TokenUsage(models.Model):
    token = models.ForeignKey(Token, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('token', 'used_at')