from rest_framework.generics import ListAPIView, ListCreateAPIView, get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from asgiref.sync import sync_to_async
from core.functions.globalFunctions import EchoLogging
from core.views import AuthenticatedAPIView
from .serializers import FeedbackSerializer, MessageFileSerializer, MessageSerializer, ThreadSerializer
from authE.models import EchoUser
from .models import Bot, Feedback, Message, MessageFile, Thread, UserBotMessagePair 
from rest_framework.exceptions import PermissionDenied

logger = EchoLogging()


async def extractUser(request):
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    token = auth_header.split(' ')[1] if auth_header else None
    if not token:
        return None
    userObj = await sync_to_async(EchoUser.objects.get)(auth_token=token)
    logger.log(f"Token: {userObj.__dict__}")
    return userObj

class ThreadList(ListAPIView):
    serializer_class = ThreadSerializer
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Thread.objects.filter(user=user).order_by('-updated_at')
        return Thread.objects.none()


class MessageListByThread(AuthenticatedAPIView, ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        thread_id = self.kwargs.get('thread_id')
        if not thread_id:
            return Message.objects.none()
        if self.request.user.is_authenticated:
            thread = get_object_or_404(Thread, id=thread_id)
            if thread.user != self.request.user:
                raise PermissionDenied("Unauthorized")
            
            messages =  Message.objects.filter(thread=thread).order_by('created_at')
            for message in messages:
                if message.by == 'bot':
                    try:
                        pair = UserBotMessagePair.objects.get(bot_message=message)
                        message.feedback = Feedback.objects.filter(messagePair=pair).first()
                    except (UserBotMessagePair.DoesNotExist, Feedback.DoesNotExist):
                        message.feedback = None
            return messages
        
        return Message.objects.none()

# class MessageList(APIView):
#     def get(self, request, *args, **kwargs):
#         thread_id = kwargs.get('thread_id')
#         thread = get_object_or_404(Thread, id=thread_id)
#         messages = Message.objects.filter(thread=thread).all()
        
#         for message in messages:
#             if message.by == 'bot':
#                 try:
#                     pair = UserBotMessagePair.objects.get(bot_message=message)
#                     message.feedback = Feedback.objects.filter(messagePair=pair).first()
#                 except (UserBotMessagePair.DoesNotExist, Feedback.DoesNotExist):
#                     message.feedback = None

#         serializer = MessageSerializer(messages, many=True)
#         return Response(serializer.data)


class FeedbackListCreateView(ListCreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def create(self, request, *args, **kwargs):
        try:
            message_id = request.data.get('message_id')
            positive = request.data.get('positive')
            feedback = request.data.get('feedback')
            if not message_id:
                logger.log("message_id is missing in the request data")
                return Response({"error": "message_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                message_pair = UserBotMessagePair.objects.get(bot_message__id=message_id)
                feedback = Feedback.objects.create(messagePair=message_pair, positive=positive, feedback=feedback)                
                feedbackSerialized = FeedbackSerializer(feedback)
                return Response(feedbackSerialized.data, status=status.HTTP_201_CREATED)
            except UserBotMessagePair.DoesNotExist:
                logger.log(f"UserBotMessagePair with id {message_id} does not exist")
                return Response({"error": "UserBotMessagePair not found"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.log(f"An error occurred: {str(e)}", exc_info=True)
                return Response({"error": "An error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.log(f"An error occurred: {str(e)}", exc_info=True)
            return Response({"error": "An error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FeedbackRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    # SEND A SUCCESS RESPONSE, change "detail" to message

class ThreadRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer

class ThreadCreateView(generics.CreateAPIView):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer

    def create(self, request, *args, **kwargs):
        user = request.user
        botId = request.data.get('bot_id')
        query = request.data.get('content')
        logger.log(f"Creating thread for bot {botId} with query {query}")

        if not botId:
            return Response({"error": "bot_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            bot = Bot.objects.get(id=botId)
        except Bot.DoesNotExist:
            return Response({"error": "Bot not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user, assistant=bot, title=query[:30] if query else None)
        logger.log(f"Thread created: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# TODO: FIX BULK CREATE VIEW FOR MESSAGEFILES

class MessageFileDeleteView(AuthenticatedAPIView, generics.DestroyAPIView):
    queryset = MessageFile.objects.all()
    serializer_class = MessageFileSerializer

    def destroy(self, request, *args, **kwargs):
        user = request.user
        file_id = kwargs.get('pk')
        file = get_object_or_404(MessageFile, id=file_id)
        
        if not user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        file.delete()
        logger.log(f"Message file deleted: {file_id}")
        return Response({"message": "File deleted"}, status=status.HTTP_204_NO_CONTENT)

class MessageFileCreateView(AuthenticatedAPIView, generics.CreateAPIView):
    queryset = MessageFile.objects.all()
    serializer_class = MessageFileSerializer
    
    def create(self, request, *args, **kwargs):
        user = request.user
        link = request.data.get('link')
        file = request.data.get('file')
        caption = request.data.get('caption')
        logger.log(f"Creating message file for data : {request.data}")

        if not user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        if file or link:
            if file and link:
                return Response({"error": "Only one of file or link is allowed"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                try:
                    serializer = self.get_serializer(data=request.data)
                    serializer.is_valid(raise_exception=True)
                    serializer.save(link=link, file=file, caption=caption)
                    logger.log(f"Message file created: {serializer.data}")
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                except Exception as e:
                    logger.log(f"An error occurred: {str(e)}", exc_info=True)
                    return Response({"error": f"An error occurred: {e}; {serializer.error}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"error": f"Bad Request: Please provide either a file or a link"}, status=status.HTTP_400_BAD_REQUEST)

        

