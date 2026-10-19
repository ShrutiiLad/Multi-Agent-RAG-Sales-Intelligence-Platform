# file_path: core/admin.py
# Description: This file is used to register the models in the admin panel.
from django.contrib import admin
from .models import  Bot, Document, Category, InterviewAnswer, InterviewQuestion, Location, ProjectType, Project, Model,  Question


admin.site.register(Document)
admin.site.register(Category)
admin.site.register(ProjectType)
admin.site.register(Project)
admin.site.register(Model)
admin.site.register(Location)
admin.site.register(Question)
admin.site.register(InterviewQuestion)
admin.site.register(InterviewAnswer)

class BotAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'openAiAssistantId','model', 'project', 'description', 'created_at', 'updated_at')
    search_fields = ('name', 'model')
    list_filter = ('created_at', 'updated_at','type','category','model','project')

admin.site.register(Bot, BotAdmin)