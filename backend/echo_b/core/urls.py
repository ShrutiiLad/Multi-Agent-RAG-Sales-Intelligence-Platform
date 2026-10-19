from django.urls import path
from .views import ListBotView, DetailBotView, CreateBotView, DocumentCreateView,NewDocumentDetailView,NewDocumentCreateView, DocumentListView, ModelListAPIView, QuestionCreateView, QuestionDetailView, QuestionList, deleteIrrelevantOpenAIAssistants


urlpatterns = [
    #BOTS-EXPERIMENTAL:
    path('bots/', ListBotView.as_view(), name='list_bots'), #TODO: Remove this line after testing
    path('bots/create/', CreateBotView.as_view(), name='create_bot'), #TODO: Remove this line after testing
    path('bots/<uuid:pk>/', DetailBotView.as_view(), name='bot-detail'),

    #DOCUMENTS-EXPERIMENTAL:
    path('new/documents/create/', NewDocumentCreateView.as_view(), name='new-document-create'), #TODO: Remove this line after testing
    path('new/documents/<uuid:document_id>/', NewDocumentDetailView.as_view(), name='new-document-detail'), #TODO: Remove this line after testing
    #ASSISTANTS:

    #QUESTIONS:
    path('assistants/<uuid:bot_id>/questions/', QuestionList.as_view(), name='question-list'),
    path('assistants/questions/create/', QuestionCreateView.as_view(), name='question-create'),
    path('assistants/questions/<uuid:pk>/', QuestionDetailView.as_view(), name='question-detail'),
    #DOCUMENTS:
    path('documents/', DocumentListView.as_view(), name='document-list'),
    path('documents/create/', DocumentCreateView.as_view(), name='document-create'),
    path('documents/<uuid:document_id>/', NewDocumentDetailView.as_view(), name='document-detail'), #DELETE, PUT, GET
    #MODELS:
    path('models/', ModelListAPIView.as_view(), name='model-list'),
]

