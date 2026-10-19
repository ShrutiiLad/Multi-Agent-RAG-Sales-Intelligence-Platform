from rest_framework import serializers
from .models import Notification, NotificationRead, Support

class NotificationSerializer(serializers.ModelSerializer):
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'

    def get_is_read(self, obj):
        """Returns True if the current user has marked this notification as read."""
        user = self.context.get('request').user
        if not user.is_authenticated:
            return False

        # Check for a read record in the NotificationRead model
        return NotificationRead.objects.filter(user=user, notification=obj).exists()

class SupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Support
        fields = '__all__'