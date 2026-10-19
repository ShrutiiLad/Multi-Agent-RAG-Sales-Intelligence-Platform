
from django.db.models.signals import post_save
from django.dispatch import receiver
from authE.models import EchoUser

from rest_framework.authtoken.models import Token
from .models import Profile

@receiver(post_save, sender=EchoUser)
def createSupportingFieldsForUser(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        Token.objects.create(user=instance)
        print("Token created")
    else:
        print("Token not created")


@receiver(post_save, sender=EchoUser)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()