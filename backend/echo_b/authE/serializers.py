from rest_framework import serializers
from .models import Profile
from authE.models import EchoUser
from django.conf import settings

class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    class Meta:
        model = Profile
        fields = '__all__' 

    def get_avatar(self, obj):
        # Construct the relative URL
        if obj.avatar:
            return f"{settings.MEDIA_URL}{obj.avatar}"
        return None


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)
    
    class Meta:
        model = EchoUser
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        user = EchoUser.objects.create_user(**validated_data)
        
        if profile_data:
            Profile.objects.create(user=user, **profile_data)
        return user