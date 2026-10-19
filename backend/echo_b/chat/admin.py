from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import ErrorLog, MessageFile, Thread, Message, Feedback, UserBotMessagePair, QueryCategory

User = get_user_model()


class ThreadAdmin(admin.ModelAdmin):
    list_display = ('id', 'title','user','assistant') 
    list_filter = ('user','assistant')

class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'purpose', 'thread', 'classification', 'get_thread_user', 'get_thread_assistant', 'created_at', 'by')
    list_filter = ('classification',  'created_at', 'by' ,'thread')

    def get_thread_user(self, obj):
        return obj.thread.user
    get_thread_user.short_description = 'User'

    def get_thread_assistant(self, obj):
        return obj.thread.assistant
    get_thread_assistant.short_description = 'Assistant' 

# Register your models here.
admin.site.register(Thread, ThreadAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(MessageFile)
admin.site.register(Feedback)
admin.site.register(UserBotMessagePair)
admin.site.register(QueryCategory)
admin.site.register(ErrorLog)
