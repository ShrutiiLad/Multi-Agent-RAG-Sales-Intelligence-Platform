from typing import Iterable
import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone

from core.models import Bot

def customUploadTo(instance, filename):
    return f'uploads/{instance.category}/{instance.created_at}/{filename}'

class QueryCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Thread(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    openAIThreadId = models.CharField(max_length=200, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    category = models.CharField(default="chat", max_length=50)
    assistant = models.ForeignKey(Bot, on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True) # Associate thread with a user
    title = models.CharField(max_length=200, null=True, blank=True, default="thread")

    def __str__(self):
        return str(self.id)
    
class Message(models.Model):
    ## PAIRs for USER AND BOT MESSAGES
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    purpose = models.CharField(default="chat", max_length=50)
    classification = models.ForeignKey(QueryCategory, on_delete=models.SET_NULL, null=True, blank=True)
    tokens = models.IntegerField(default=0)
    by = models.CharField(default="user", max_length=50, choices=[("user", "user"), ("bot", "bot")])
    sources = models.JSONField(null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.thread.updated_at = timezone.now()
        self.thread.save()


class MessageFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, null=True, blank=True)
    link = models.URLField(null=True, blank=True)
    file = models.ImageField(upload_to=customUploadTo, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    category = models.CharField(default="images", max_length=50)
    caption = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return str(self.message)

class Run(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    run_id = models.CharField(max_length=100, unique=True)
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE)
    status = models.CharField(max_length=50)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(default="chat", max_length=50)

    class Meta:
        ordering = ['created_at']

class ErrorLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=100)
    message = models.TextField()
    
    error = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(default="chat", max_length=50)

    class Meta:
        ordering = ['created_at']

class UserBotMessagePair(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="user_pairs")
    bot_message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="bot_pairs")
    created_at = models.DateTimeField(auto_now_add=True)
    tokens = models.IntegerField(default=0, null=True, blank=True)
    response_time = models.DurationField(null=True, blank=True)
    
    class Meta:
        ordering = ['created_at']


class Feedback(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    feedback = models.TextField(null = True, blank = False)
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(default="chat", max_length=50)
    positive = models.BooleanField(null = True, blank = False)
    messagePair = models.ForeignKey(UserBotMessagePair, on_delete=models.CASCADE,null=True, blank=True)

    ## We have to have two user queries query and bot answer

    class Meta:
        ordering = ['positive']

    def __str__(self):
        return f"{self.messagePair} - {self.positive}"


## FINETUNING PIPELINE ##
