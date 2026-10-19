# file_path: echo_b/echo_b/core/views.py
import logging
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from chat.models import Message
from django.db.models import Count
from core.functions.documents.documents import DocumentService
from core.functions.globalFunctions import EchoLogging
from core.functions.bots.helpers import OpenAIAssistantHandler
from .models import Bot, Document, Model, Question
from .serializers import DocumentSerializer, ModelSerializer, QuestionSerializer, BotSerializer  # Assuming AssistantSerializer exists
from core.functions.bots.assistants import BotService
from uuid import UUID
from django.db.models import Q
import markdown2
import os
from rest_framework import generics
from pathlib import Path

logger =EchoLogging()
class AuthenticatedAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

class ListBotView(AuthenticatedAPIView,ListAPIView):
    serializer_class = BotSerializer
    queryset = Bot.objects.all()

    def get_queryset(self):
        """
        This method is used to filter the queryset based on the query parameters.
        params:
            sortBy: popular, recent, oldest, name
        returns:
            queryset
        """
        queryset = super().get_queryset()
        sort_by = self.request.query_params.get('sortBy', None)
        if sort_by is not None:
            if sort_by == 'popular':
                queryset = queryset.annotate(thread_count=Count('thread', distinct=True)).order_by('-thread_count')
                return queryset
            elif sort_by == 'recent':
                queryset = queryset.order_by('-created_at')
            elif sort_by == 'oldest':
                queryset = queryset.order_by('created_at')
            elif sort_by == 'name':
                queryset = queryset.order_by('name')
        return queryset

class CreateBotView(AuthenticatedAPIView, CreateAPIView):
    serializer_class = BotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            logger.log(f"Creating assistant: {request.data}")
            user = request.user
            request.data['author'] = user.id
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.log(f"Failed to create assistant: {e}")
            return Response({"error": f"Failed to create assistant : {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DetailBotView(AuthenticatedAPIView, RetrieveUpdateDestroyAPIView):
    serializer_class = BotSerializer
    queryset = Bot.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"success": True, "message": "Assistant deleted successfully."}, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        try:
            logger.log(f"Updating assistant. {request.data}")
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            logger.log(f"Instance: {instance}, data: {request.data}")
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            logger.log(f"Assistant updated: {serializer.data}")
            return Response(serializer.data)
        except Exception as e:
            logger.log(f"Failed to update assistant: {e}")
            return Response({"error": f"Failed to update assistant: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class QuestionList(ListAPIView):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        logging.info(self.kwargs)
        bot_id = self.kwargs.get('bot_id')
        return Question.objects.filter(assistant__id=bot_id)
    

class QuestionCreateView(AuthenticatedAPIView, generics.CreateAPIView):
    serializer_class = QuestionSerializer

    def create(self, request, *args, **kwargs):
        bot_id = request.data.get('bot_id')
        if not bot_id:
            return Response({"error": "Bot ID is required.", "success": False}, status=status.HTTP_400_BAD_REQUEST)
        try:
            bot = BotService.getBot(bot_id)
            if not bot:
                return Response({"error": "Bot not found.", "success": False}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e), "success": False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        questions = request.data.get('questions')
        if isinstance(questions, list):
            serialized_questions = []
            for question_text in questions:
                serializer = self.get_serializer(data={"question": question_text, "assistant": bot_id})
                serializer.is_valid(raise_exception=True)
                serializer.save(assistant=bot)
                serialized_questions.append(serializer.data)
            return Response({"success": True, "questions": serialized_questions}, status=status.HTTP_201_CREATED)
        else:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(assistant=bot) 
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class QuestionDetailView(AuthenticatedAPIView, RetrieveUpdateDestroyAPIView):
    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"success": True, "message": "Question deleted successfully."}, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

def index(request):
    # base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    readme_path = os.path.join(settings.BASE_DIR, 'README.md')
    print(readme_path)
    with open(readme_path, 'r') as file:
        readme_content = file.read()
    html_content = markdown2.markdown(readme_content)
    return HttpResponse(html_content)

class DocumentCreateView(AuthenticatedAPIView,APIView):
    def post(self, request):
        data = request.data
        logging.info(data)
        try:
            document = DocumentService.create_document(
                title=data.get('title'),
                description=data.get('description'),
                source=data.get('source'),
                url=data.get('url'),
                author=data.get('author'),
                category=data.get('category'),
                file=request.FILES.get('file') if 'file' in request.FILES else None,
                type=data.get('type'),
                project=data.get('project'),
                location=data.get('location'),
                summary=data.get('summary'),
                associated_with=data.get('associated_with')
            )
            if document:
                logging.info(f"Document created: {document}")
                serializer = DocumentSerializer(document)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return JsonResponse({"error": f"{document}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logging.error(f"Failed to create document: {e}")
            return JsonResponse({"error": f"Failed to create document.{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DocumentListView(AuthenticatedAPIView, ListAPIView):
    serializer_class = DocumentSerializer
    
    def get_queryset(self):
        queryset = DocumentService.list_documents()
        filters = Q()
        for key, value in self.request.query_params.items():
            if key in ['title', 'author', 'source', 'url', 'category', 'type', 'project', 'location']:
                filters |= Q(**{key: value})
        return queryset.filter(filters)
    

# STILL HAVE TO CHECK IF VECTORS ARE BEING DELETED ALRIGHT

class ModelListAPIView(AuthenticatedAPIView, ListAPIView):
    serializer_class = ModelSerializer
    queryset = Model.objects.all()


class NewDocumentCreateView(AuthenticatedAPIView, generics.CreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            logger.log(f"Creating Document: {request.data}")
            user = request.user
            # request.data['author'] = user.username
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.log(f"Failed to create document: {e}",   exc_info=True)
            return Response({"error": f"Failed to create document : {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class NewDocumentDetailView(AuthenticatedAPIView,RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    queryset = Document.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'document_id'
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            logger.log(f"Document Deleted: {instance}")
            return Response({"message":f"The document has been deleted successfully"},status=status.HTTP_200_OK)
        except Exception as e:
            logger.log(f"Failed to delete document: {e}", exc_info=True)
            return Response({"error": f"Failed to delete document: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', True)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            logger.log(f"Updating Document: {request.data}")
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            logger.log(f"Failed to update document: {e}", exc_info=True)
            return Response({"error": f"Failed to update document: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class deleteIrrelevantOpenAIAssistants(APIView):
    
    assistantHandler = OpenAIAssistantHandler()

    def getEchoAssistantsOAIds(self):
        bots = Bot.objects.exclude(openAiAssistantId=None).all()
        echoOAIds = [bot.openAiAssistantId for bot in bots]
        return echoOAIds

    def getAssistants(self):
        openAIAssistants = self.assistantHandler.listOAAssistants()
        if openAIAssistants["success"]:
            return openAIAssistants["assistants"]
        else:
            logger.log(f"Failed to get assistants: {openAIAssistants['error']}")
            return []

    def deleteAssistants(self, assistants):
        try:
            echoIds = self.getEchoAssistantsOAIds()
            numberOfDeletedAssistants = 0
            for assistant in assistants:
                if assistant.id not in echoIds:
                    numberOfDeletedAssistants += 1
                    logger.log(f"Deleting irrelevant assistant: {assistant.id}")
                    try:
                        response = self.assistantHandler.cleanDeleteOAAssistant(assistant.id)
                        logger.log(f"Assistant deleted: {response}")
                    except Exception as e:
                        logger.log(f"Failed to delete assistant {assistant.id}: {e}", exc_info=True)
                        continue
                    logger.log(f"Assistant deleted successfully.")
                else:
                    logger.log(f"Assistant {assistant.id} is relevant.")
            return {"success": True,"number": numberOfDeletedAssistants}
        except Exception as e:
            logger.log(f"Failed to delete irrelevant assistants: {e}", exc_info=True)
            return {"success": False, "error": f"Failed to delete irrelevant assistants: {e}"}

    def post(self, request):
        try:
            openAIAssistants = self.getAssistants()
            logger.log(f"OpenAI Assistants: {openAIAssistants}")
            letsGo = True
            if letsGo:
                # i want a loop where we getassistants --> check if they are in echo --> delete if not --> repeat until no more assistants
                numberDeleted = self.deleteAssistants(openAIAssistants)
                if numberDeleted["success"]:
                    return Response({"success": True, "message": f"{numberDeleted['number']} Irrelevant assistants deleted successfully."}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": f"Failed to delete irrelevant assistants: {numberDeleted['error']}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({"success": False, "message": f"This is a test endpoint. Set letsGo to True to delete {len(openAIAssistants)} irrelevant assistants."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.log(f"Failed to delete irrelevant assistants: {e}")
            return Response({"error": f"Failed to delete irrelevant assistants: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    