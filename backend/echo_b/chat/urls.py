from django.urls import path
from .views import   MessageFileCreateView, MessageListByThread, ThreadCreateView, FeedbackListCreateView, FeedbackRetrieveUpdateDestroyView, ThreadRetrieveUpdateDestroyView, ThreadList

urlpatterns = [
    #Create the first message and thread
    path('threads/', ThreadList.as_view(), name='thread_list'),
    path('threads/create/', ThreadCreateView.as_view(), name='thread_create_view'),
    path('threads/<uuid:pk>/', ThreadRetrieveUpdateDestroyView.as_view(), name='thread_retrieve_update_destroy'),
    path('threads/<uuid:thread_id>/messages/', MessageListByThread.as_view(), name='message_list'),
    path('feedback/', FeedbackListCreateView.as_view(), name='feedback-list-create'),
    path('feedback/<uuid:pk>/', FeedbackRetrieveUpdateDestroyView.as_view(), name='feedback-retrieve-update-destroy'),
    path('file/add/', MessageFileCreateView.as_view(), name='file_upload_view'),
   # path('files/add/', BulkMessageFileCreateView.as_view(), name='bulk_file_upload_view'),
]