from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
import uuid
# Create your models here.
class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, verbose_name='ID', help_text='Unique ID for the update')
    title = models.CharField(max_length=100, verbose_name='Title', help_text='Enter a title for the update')
    description = models.TextField(null=True, blank=True, default=None, max_length=500, verbose_name='Description', help_text='Enter a brief description of the update')
    date = models.DateTimeField(auto_now_add=True, verbose_name='Date', help_text='Enter the date of the update')
    version = models.CharField(max_length=10, verbose_name='Version', help_text='Enter the version of the update')
    primaryLink = models.URLField(max_length=200, verbose_name='Link', help_text='Enter the link to the update', null=True, blank=True, default=None)
    secondaryLink = models.URLField(max_length=200, null=True, blank=True, default=None, verbose_name='Secondary Link', help_text='Enter a secondary link to the update')

    def __str__(self):
        return self.title
    
class Support(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True, verbose_name='ID', help_text='Unique ID for the support')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name='User', help_text='Enter the user who requested the support', on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=100, verbose_name='Title', help_text='Enter a title for the support')
    description = models.TextField(null=True, blank=True, default=None, max_length=500, verbose_name='Description', help_text='Enter a brief description of the support')
    date = models.DateTimeField(auto_now_add=True, verbose_name='Date', help_text='Enter the date of the support')
    status = models.CharField(max_length=20, verbose_name='Status', help_text='Enter the status of the support', choices=[('Open', 'Open'), ('Closed', 'Closed')])
    priority = models.CharField(max_length=20, verbose_name='Priority', help_text='Enter the priority of the support', choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')])
    notes = models.TextField(null=True, blank=True, default=None, max_length=500, verbose_name='Notes', help_text='Enter any notes for the support')

    def __str__(self):
        return self.title
    

class NotificationRead(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'notification')

    def __str__(self):
        return f'{self.user} - {self.notification}'