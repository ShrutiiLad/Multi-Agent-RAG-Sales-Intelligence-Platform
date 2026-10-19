from django.urls import path
from .views import NotificationViewSet, UpdateRetrieveUpdateDestroyView, SupportRetrieveUpdateDestroyView, UpdateCreateView, SupportCreateView, SupportCreateView, UpdateListView, SupportListView


urlpatterns = [

    path('updates/create/', UpdateCreateView.as_view(), name='update-create'),
    path('updates/', UpdateListView.as_view(), name='update-list'),
    path('updates/<uuid:pk>/', UpdateRetrieveUpdateDestroyView.as_view(), name='update-retrieve-update-destroy'),
    path('updates/<uuid:pk>/read/', NotificationViewSet.as_view({'post': 'mark_as_read'}), name='update-mark-as-read'),
    path('updates/readAll/', NotificationViewSet.as_view({'post': 'mark_all_as_read'}), name='update-mark-as-all-read'),

    path('supports/create/', SupportCreateView.as_view(), name='support-create'),
    path('supports/', SupportListView.as_view(), name='support-list'),
    path('supports/<uuid:pk>/', SupportRetrieveUpdateDestroyView.as_view(), name='support-retrieve-update-destroy'),
    
]