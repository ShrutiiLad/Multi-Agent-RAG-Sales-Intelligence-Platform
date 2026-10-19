from django.shortcuts import render
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.utils import timezone
from .models import Notification, Support,NotificationRead
from .serializers import NotificationSerializer, SupportSerializer
from rest_framework.permissions import IsAuthenticated
from adminE.views import IsAdminOrStaffUser
# Create your views here.


# TODO: Add the permissions during launch of the project
class UpdateListView(generics.ListAPIView):
    queryset = Notification.objects.all().order_by('-date')
    serializer_class = NotificationSerializer
    # permission_classes = [IsAdminOrStaffUser]

class UpdateRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrStaffUser]

class UpdateCreateView(generics.CreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrStaffUser]

class SupportListView(generics.ListAPIView):
    queryset = Support.objects.all().order_by('-date')
    serializer_class = SupportSerializer
    permission_classes = [IsAuthenticated]

class SupportRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Support.objects.all()
    serializer_class = SupportSerializer
    permission_classes = [IsAuthenticated]

class SupportCreateView(generics.CreateAPIView):
    serializer_class = SupportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        user = request.user
        obj, created = NotificationRead.objects.get_or_create(
            user=user, notification=notification
        )
        obj.read_at = timezone.now()
        obj.save()
        return Response({'status': 'marked as read'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        # Retrieve all unread notifications for the user
        unread_notifications = Notification.objects.exclude(
            id__in=NotificationRead.objects.filter(user=user).values_list('notification_id', flat=True)
        )

        # Create or update the NotificationRead model for each unread notification
        for notification in unread_notifications:
            NotificationRead.objects.update_or_create(
                user=user, notification=notification,
                defaults={'read_at': timezone.now()}
            )

        return Response({'status': 'all notifications marked as read'}, status=status.HTTP_200_OK)