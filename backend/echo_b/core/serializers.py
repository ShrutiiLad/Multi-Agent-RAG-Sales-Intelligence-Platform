from rest_framework import serializers
from .models import Bot, Document, Model, Question
from django.conf import settings
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
        search_fields = ['question']

class BotSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    thread_count = serializers.SerializerMethodField()
    class Meta:
        model = Bot
        fields = '__all__'
        search_fields = ['name', 'model']

    def get_avatar(self, obj):
        if obj.avatar:
            return f"{settings.MEDIA_URL}{obj.avatar}"
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.author:
            representation["author"] = instance.author.username  # Include author username
        representation["avatar"] = self.get_avatar(instance)  # Include avatar URL
        return representation
    
    def get_thread_count(self, obj):
        return obj.thread_set.count()


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        search_fields = ['title', 'content',
                         'author', 'source', 'published_at']
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['bots'] = instance.bots.count()
        representation["file"] = self.get_file(instance)  # Include avatar URL
        return representation

    def get_file(self, obj):
        if obj.file:
            return f"{settings.MEDIA_URL}{obj.file}"
        return None

class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = '__all__'
# TODO: ADD RUDIMENTARY AUTH FUNCTIONALITY
