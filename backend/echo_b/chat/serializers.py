# serializers.py
from django.conf import settings
from core.functions.globalFunctions import EchoLogging
from .models import Feedback, MessageFile, Thread, Message, Run, UserBotMessagePair
from rest_framework import serializers
from channels.db import database_sync_to_async
import logging

logger = EchoLogging()


class MessageFileSerializer(serializers.ModelSerializer):

    def get_file(self, obj):
        if obj.file:
            return f"{settings.MEDIA_URL}{obj.file}"
        return None
    class Meta:
        model = MessageFile
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['file'] = self.get_file(instance)
        return representation

class ThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation:
            if instance.assistant:
                representation['agent'] = {
                    "name": instance.assistant.name,
                    "init": instance.assistant.name[:2].upper() if instance.assistant.name else None,
                    "avatar": instance.assistant.avatar.url if instance.assistant.avatar else "",
                    "disabled": instance.assistant.disabled,
                }
                return representation
            else:
                representation['agent'] = {
                    "name": "Deleted Agent",
                    "init": "de",
                    "deleted": True,
                    "avatar": "",
                    "disabled": True,
                }
                return representation
        else:
            return None

class MessageSerializer(serializers.ModelSerializer):
    feedback = serializers.SerializerMethodField()
    files = MessageFileSerializer(source='messagefile_set', many=True, read_only=True)
    class Meta:
        model = Message
        fields = '__all__'

    def get_feedback(self, instance):
        if instance.by == "bot":
            feedback = getattr(instance, 'feedback', None)
            if feedback:
                return {
                    "id": feedback.id,
                    "positive": feedback.positive,
                }
        return None
    

class RunSerializer(serializers.ModelSerializer):
    class Meta:
        model = Run
        fields = '__all__'


class UserBotMessagePairSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBotMessagePair
        fields = ['user_message', 'bot_message', 'created_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['query'] = instance.user_message.content
        representation['answer'] = instance.bot_message.content
        return representation
    

class FeedbackSerializer(serializers.ModelSerializer):
    feedback = serializers.CharField(required=False)

    class Meta:
        model = Feedback
        fields = '__all__'

