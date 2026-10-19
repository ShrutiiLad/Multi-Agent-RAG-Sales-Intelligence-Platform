import uuid
from django.conf import settings
from django.db import models
import logging
from core.functions.bots.helpers import OpenAIAssistantHandler
from django.utils import timezone
from django.core.validators import FileExtensionValidator
from authE.models import EchoUser
from core.functions.globalFunctions import EchoLogging

model_codes = ["gpt-3.5-turbo","gpt-3.5-turbo-0125","gpt-4-turbo","gpt-4-1106-preview", "gpt-4-0125-preview"]

model_codes= [(code, code) for code in model_codes]
# Create your models here.
import dotenv
import os

logger = EchoLogging()
class ProjectType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
    
class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    type = models.CharField(ProjectType, max_length=100, default=1)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']


class Location(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, choices=model_codes)

    def __str__(self):
        return self.name

class Model(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_code = models.CharField(max_length=100, null=True, blank=True, unique=True, choices=model_codes)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.model_code

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

def custom_upload_to(instance, filename):
    file_format = filename.split('.')[-1]
    current_date = timezone.now().strftime('%Y-%m-%d')
    path = f'documents\{current_date}\{file_format}\{filename}'
    return path

class Document(models.Model):
    DOC_TYPES = [("general", "General"), ("interview", "Interview"), ("hybrid", "Hybrid"), ("mega", "Mega")]
    DOC_CATEGORIES = [("general", "General"),("project insights", "Project Insights"), ("user roles", "User Roles"), ("user support", "User Support"), ("markets", "Markets"), ("others", "Others")]
    STRENGTH_CHOICES = [("1", 'Very Low'), ("2", 'Low'), ("3", 'High'),("4", 'Very High')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=200)
    summary = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True, default="Echo AI helps you build RAG tools at scale.")
    source = models.CharField(max_length=200, null=True, blank=True)
    url = models.CharField(max_length=200, null=True, blank=True)
    author = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    category = models.CharField(max_length=200, null=True, blank=True, default="general",choices=DOC_CATEGORIES)
    file = models.FileField(upload_to=custom_upload_to, null=True, blank=True)
    associated_with = models.ManyToManyField('self', blank=True)
    type = models.CharField(max_length=100, default="general", choices=DOC_TYPES)
    strength = models.CharField(max_length=100, choices = STRENGTH_CHOICES, default="1")
    summaries_id = models.CharField(max_length=100, null=True, blank=True)
    file_content_id = models.CharField(max_length=100, null=True, blank=True)
    project = models.CharField(max_length=200, null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['created_at', 'title', 'author', 'published_at']


def get_default_model():
    model, created = Model.objects.get_or_create(
        model_code=model_codes[1][0],
        defaults={'name': "GPT-3.5 Turbo"}
    )
    return model.id

class Bot(models.Model):
    BOT_CHOICES = [("general", "General"),("discover", "Discover"), ("project insights", "Project Insights"), ("user roles", "User Roles"), ("user support", "User Support"), ("markets", "Markets"), ("others", "Others"), ("interview", "Interview"), ("hybrid", "Hybrid"), ("mega", "Mega")]
    BOT_CATEGORY = [("general","General Agent"), ("role","Role Agent")]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    openAiAssistantId = models.CharField(max_length=100, editable=False, unique=True, null = True)
    name = models.CharField(max_length=200)
    init = models.CharField(max_length=2, null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    model = models.ForeignKey(Model, on_delete=models.SET_DEFAULT ,null=True, blank=True, default=get_default_model)
    instructions = models.TextField(null=True, blank=True)
    rules = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    documents = models.ManyToManyField(Document, related_name="bots", blank=True)
    rag = models.BooleanField(default=True)
    disabled = models.BooleanField(default=False)
    category = models.CharField(max_length=100, default="general", choices=BOT_CATEGORY)
    type = models.CharField(max_length=100, default="discover", choices=BOT_CHOICES)
    avatar = models.ImageField(upload_to='bots/avatars/',validators=[FileExtensionValidator(['jpg','jpeg', 'png', 'svg'])], null=True, blank=True)
    customAvatar = models.ImageField(upload_to='bots/avatars/', null=True, blank=True)
    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.openAiAssistantId} - {self.id}"

    def get_category_display(self, obj):
        return obj.get_category_display() 

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        assistantHandler = OpenAIAssistantHandler()
        if not self.init:
            self.init = self.name[:2] if self.name else "EC"
        try:
            if self.documents.count() == 0:
                self.rag = False
            else:
                self.rag = True

            update_kwargs = {
                "name": self.name,
                "instructions": assistantHandler.systemPrompt(self.instructions, self.rules),
                "model": self.model.model_code,
                "tools": [], # Adjust this based on your actual tools
            }

            if self.openAiAssistantId is None:
                logger.log("Assistant does not exist. Creating assistant.")
                response = assistantHandler.createOAAssistant(**update_kwargs)
                if response["success"]:
                    print(response["assistant_id"])
                    self.openAiAssistantId = response["assistant_id"]
                    self.save() 
                else:
                    logger.log("Failed to create assistant: " + response["error"])
                logger.log("create_assistant completed successfully.")
            else:
                logger.log("Assistant already exists.")
                response = assistantHandler.updateOAAssistant(self.openAiAssistantId, **update_kwargs)
                if response["success"]:
                    logger.log("Assistant updated successfully.")
                else:
                    logger.log("Failed to update assistant: " + response["error"])  
        except Exception as e:
            logger.log(f"Error in create_assistant: {e}")
            raise e

class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    assistant = models.ForeignKey(Bot, on_delete=models.CASCADE, related_name="questions")
    
    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.question
    

class InterviewQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="questions", null=True, blank=True)
    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.question
    

class InterviewAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    question = models.ForeignKey(InterviewQuestion, on_delete=models.CASCADE, related_name="answers", null=True, blank=True)
    
    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.answer