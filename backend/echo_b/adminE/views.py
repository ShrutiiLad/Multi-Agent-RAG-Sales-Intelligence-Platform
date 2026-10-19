from django.apps import apps
from authE.models import EchoUser
from rest_framework import generics
from rest_framework import permissions
from authE.serializers import UserSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from echo_b.management.commands.adminStats import AdminStats
from echo_b.management.commands.botStats import AdminBotStats

class IsAdminOrStaffUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)
    
# Create your views here.
class UserListView(generics.ListCreateAPIView):
    queryset = EchoUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrStaffUser]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated,IsAdminOrStaffUser]

    def get_queryset(self):
        return EchoUser.objects.filter(pk=self.kwargs['pk'])

class UserCreateView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrStaffUser]


class AdminStatView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get(self, request):
        models = apps.get_models()
        admin_stats = AdminStats(models)
        all_stats = admin_stats.getAllStats()
        return Response(all_stats)

class BotStatView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def get(self, request):
        models = apps.get_models()
        bot_stats = AdminBotStats(models)
        all_stats = bot_stats.getBotStats()
        return Response(all_stats)