import re
import asyncio
import json
from uuid import UUID
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from django.core.exceptions import ValidationError

from chat.functions.LLMFunctions.classification import getClassification, getIsSourceNecessary
from chat.functions.LLMFunctions.captioning import getCaptions, handleCaptioning
from core.functions.globalFunctions import EchoLogging, ErrorHandler, UUIDEncoder
from chat.functions.utilities import AgentOperations, MessageCreationService
from core.models import Model
from .models import Message, Thread  # Assuming Assistant is the model for your assistant object
from datetime import datetime as DateTime
from django.core.exceptions import ObjectDoesNotExist
from typing import List

logger = EchoLogging()
## TODO: 
class ChatConsumer(AsyncWebsocketConsumer):
    """
    ChatConsumer class for handling the WebSocket connection.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._is_accepted = False
        self.gpt4ID = None

    @ErrorHandler.logAndHandleErrors
    def getModelCode(self):
        GPT4ModelCode = "gpt-4-turbo"
        try:
            self.gpt4ID = Model.objects.get(model_code=GPT4ModelCode).id
        except ObjectDoesNotExist:
            self.gpt4ID = None
            logger.log(f"Model with code {GPT4ModelCode} not found.", exc_info=True)
        except Exception as e:
            logger.log(f"Error finding the GPT-4 model: {e}", exc_info=True)
            raise ValueError("Error finding the GPT-4 model")

    @ErrorHandler.logAndHandleErrors
    def visionEnabler(self, bot):
        self.getModelCode()
        if bot.model:
            if self.gpt4ID:
                self.isVisionEnabled = bot.model.id == self.gpt4ID
                logger.log(f"Vision enabled: {self.isVisionEnabled}")
            else:
                self.isVisionEnabled = False
                logger.log("The given model does not support vision.")
        else:
            self.send_error("Error: Assistant is missing a model.")
            raise ValueError("Assistant is missing a model")

    @ErrorHandler.logAndHandleErrors
    @database_sync_to_async
    def getImps(self, threadId):
        try:
            self.getModelCode()
            thread = Thread.objects.get(id=threadId)
            if not thread.assistant:
                self.send_error("Assistant has been deleted. You can still view prior messages.")
            if thread:
                self.thread = thread
                self.bot = thread.assistant
                if self.bot:
                    self.visionEnabler(self.bot)
                else:
                    self.send_error("Error: Assistant not found.")
                    raise ValueError("Assistant not found")
                try:
                    self.rag = self.bot.rag
                    self.isInterview = True if "interview" in self.bot.documents.values_list('type', flat=True) else False
                    self.isMega = self.bot.type in ["mega"]
                    try:
                        self.openAIAgent = AgentOperations.initAgent(self.bot.openAiAssistantId)
                    except Exception as e:
                        self.send_error("Sorry! This assistant is not available at the moment. Please try again later.")
                        #raise ValueError("OpenAI Assistant not found.")
                except AttributeError as e:
                    missing_attr = str(e).split("'")[1]
                    self.send_error(f"Error: Missing necessary attribute '{missing_attr}' in Assistant settings.")
                    raise AttributeError(f"Assistant is missing the attribute: {missing_attr}")
                except Exception as e:
                    self.send_error("Error: Assistant is not available at the moment. Please try again later.")
                    #raise ValueError("Assistant not available")
        except ObjectDoesNotExist:
            self.send_error("Error: Thread not found.")

    @ErrorHandler.logAndHandleErrors
    async def connect(self):
        """
        Connects to the WebSocket and initializes the necessary components.
        """
        try:
            await self.accept()
            logger.log("Connecting to WebSocket")
            self.threadId = UUID(self.scope['url_route']['kwargs']['thread_id'])
            await self.getImps(self.threadId)
        except (KeyError, ValueError) as e:
            await self.send_error("Invalid thread ID or assistant not found.")
            await self.close(1000) 
        except Exception as e:
            logger.log(f"Unhandled exception during WebSocket connection: {e}")
            await self.send_error("Internal server error. Closing connection.")
            await self.close(1000)

    @ErrorHandler.logAndHandleErrors
    async def receive(self, text_data):
        logger.log(f"Received data: {text_data}")
        try:
            queryObj, imagesUrls = await Handler(consumer=self).extractQuery(text_data)
            runStarted = DateTime.now()
            contextDict = await self.gatherContext(queryObj, imagesUrls)  # Make sure to await this call
            logger.log(f"<<Query>>: {queryObj.content}")
            await self.sendResponse(runStarted,queryObj=queryObj,**contextDict)
            # await self.send(text_data=json.dumps({"payload": contextDict["sources"], "query": contextDict["prompt_with_context"]}))
        except ValueError as e:
            await self.send_error(e.args[0])
        except Exception as e:
            logger.log(f"Error during message reception: {e}")
            await self.send_error("Internal server error")

    @ErrorHandler.logAndHandleErrors
    async def gatherContext(self, queryObj: Message, imagesUrls: List[str]):
        openAIThreadId = await self.threadHandler()
        query = queryObj.content
        isSourceNecessary = getIsSourceNecessary(query)
        try:
            tasks = [
                getClassification(query),
                MessageCreationService.createNewContext(self.bot, query, isSourceNecessary, self.isInterview)
            ]
            if imagesUrls:
                logger.log(f"Images found: {imagesUrls}")
                tasks.append(handleCaptioning(imagesUrls,queryObj))
            results = await asyncio.gather(*tasks)
            query_category = results[0]
            prompt_with_context, sources = results[1]
            if imagesUrls:
                image_captions = results[2]
                logger.log(f"ImageCaptions: {image_captions}")
                prompt_with_context = f"{image_captions}.\n\n based on the above information answer the following: {prompt_with_context}"
            logger.log(f"PromptWithImage: {prompt_with_context}")
            return {
                "openAIThreadId": openAIThreadId,
                "query_category": query_category,
                "prompt_with_context": prompt_with_context,
                "sources": sources,
            }
        except Exception as e:
            logger.log(f"Error gathering context: {e}", exc_info=True)
            return {
                "openAIThreadId": openAIThreadId,
                "prompt_with_context": query,
                "query_category": None,
                "sources": None,
                "image_captions": None
            }

    @ErrorHandler.logAndHandleErrors
    async def sendResponse(self,  runStarted:DateTime, queryObj:Message = None,  **kwargs):
        try:
            logger.log(f"Sending new response: {kwargs['prompt_with_context']}")
            stream = await self.streamResponse(kwargs['openAIThreadId'], kwargs['prompt_with_context'])
            logger.log(f"Sources in sendNewResponse: {kwargs.get('sources')}")
            await self.handleStreamStatsAndCreateMessage(
                                                            stream=stream,
                                                            sources=kwargs.get('sources'),
                                                            query=kwargs.get('query_category'),  # This might need clarification or renaming
                                                            runStarted=runStarted,
                                                            classification=kwargs.get('query_category'),  # Possible duplication with query?
                                                            queryObj=queryObj
                                                        )
            logger.log(f"done streaming: {stream}")
        except Exception as e:
            logger.log(f"Error sending new response: {e}", exc_info=True)
            raise ValueError("Error sending new response")

    @ErrorHandler.logAndHandleErrors
    async def threadHandler(self):
        openAiThreadId = self.thread.openAIThreadId
        if openAiThreadId:
            return openAiThreadId
        else:
            logger.log("Creating new OpenAI thread")
            createdOpenAIThreadId =await AgentOperations.createOpenAIThread(self.bot, self.thread)
            return createdOpenAIThreadId
        
    
    @ErrorHandler.logAndHandleErrors
    async def stopRun(self):
        logger.log(f"Stopping run {self.currentRunId}")
        #implement stop run

#TODO: Clean up the code and make the stream stop mid way through
#TODO: Create RUN HANDLING FUNCTION
        
    ############# -- NEW FUNCTION -- #############
    @ErrorHandler.logAndHandleErrors
    async def streamResponse(self, openAIThreadId, promptWithContext):
        logger.log(f"MESSAGE_SENT_TO_BOT {promptWithContext}")
        self.openAIAgent.client.beta.threads.messages.create(
            thread_id=str(openAIThreadId),
            role="user",
            content=promptWithContext
        )
        with self.openAIAgent.client.beta.threads.runs.stream(
            assistant_id=str(self.bot.openAiAssistantId),
            thread_id=str(openAIThreadId),
        ) as stream:
            event_task = asyncio.create_task(self.getRunId(stream))
            text_task = asyncio.create_task(self.stream_text_deltas(stream))
            done, pending = await asyncio.gather(event_task, text_task)
            stream.until_done()
            self.runId = None
            logger.log(f"Done?{done}- Pending? {pending}")
            logger.log(stream._current_message_content)
            return stream

    @ErrorHandler.logAndHandleErrors
    async def getRunId(self, stream):
        for event in stream:
            try:
                runId = event.data.id
                self.currentRunId = runId
                if runId:
                    break 
                return runId
            except Exception as e:
                logger.log(f"Error capturing Run ID: {e}", exc_info=True)
                break 

    @ErrorHandler.logAndHandleErrors
    async def stream_text_deltas(self, stream):
        for text in stream.text_deltas:
            await self.send(text_data=json.dumps(text))
            await asyncio.sleep(0.1)


    @ErrorHandler.logAndHandleErrors
    async def handleStreamStatsAndCreateMessage(self, **kwargs):
        """
        Handle the stream stats and create the message object.
        """
        try:
            stream = kwargs.get('stream')
            logger.log(f"classification: {kwargs.get('classification')}")
            logger.log(f"Handling stream stats and creating message {stream}")
            logger.log(f"Sources in handleStreamStatsAndCreateMessage: {kwargs.get('sources')}")
            completeStreamResponse = stream._current_message_content.text.value
            cb = stream._AssistantEventHandler__current_run.usage
            runEnded = DateTime.now()
            botMessageObj = await MessageCreationService._create_and_pair_messages(
                kwargs.get('query'), 
                completeStreamResponse, 
                cb, 
                self.thread, 
                sources =kwargs.get('sources'), 
                serialized=True, 
                runStartedTime=kwargs.get('runStarted'), 
                runCompletedTime=runEnded,
                classification=kwargs.get('classification'), 
                queryObj=kwargs.get('queryObj')
            )
            logger.log(botMessageObj)
            await self.send(text_data=json.dumps(botMessageObj, cls=UUIDEncoder))
        except Exception as e:
            logger.log(f"Error handling stream stats and creating message: {e}", exc_info=True)
            raise ValueError("Error handling stream stats and creating message")


    @ErrorHandler.logAndHandleErrors
    async def send_error(self, error_message):
        """
        Sends an error message to the client and closes the WebSocket connection.
        """
        try:
            if hasattr(self, 'threadId'): 
                await self.send(text_data=json.dumps({"error": error_message}))
                logger.log(f"Sent error message: {error_message}", exc_info=True)
            else:
                logger.log("Attempted to send error, but WebSocket not accepted or initialized.")
        except Exception as e:
            logger.log(f"Error sending error message: {e}", exc_info=True) 
        await self.close(1000) 

class Handler:
    """
    Handler class for processing user queries.
    """
    def __init__(self, consumer):
        self.consumer = consumer
        logger.log("Handler initialized")
    
    @ErrorHandler.logAndHandleErrors
    async def extractQuery(self, textData):
        """
        Extracts the user query from the text data.
        Args:
            textData (str): The text data received from the WebSocket.
        Returns:
            Tuple containing the user query object and a list of image URLs.
        """
        if not textData:
            logger.log("No text data received")
            raise ValueError("Couldn't receive text data")
        try:
            payload = json.loads(textData)
            logger.log(f"Payload: {payload}")
            message_content = payload.get('content')
            if message_content is None:
                logger.log("No content in payload")
                raise ValueError("No content found in payload")
            userQuery = await sync_to_async(self.create_message)(content=message_content, thread=self.consumer.thread, by="user")
            logger.log(f"User query object created: {userQuery}")
            imageUrls = payload.get('imageUrls', [])
            logger.log(f"Gathering images: {imageUrls}")
            if payload.get('stop'):
                self.consumer.stopRun()
            return userQuery, imageUrls
        except json.JSONDecodeError as e:
            logger.log(f"Error parsing JSON: {e}", exc_info=True)
            raise ValueError("Error parsing JSON: " + str(e))
        except ValidationError as e:
            logger.log(f"Error creating message: {e}", exc_info=True)
            raise ValueError("Error creating message: " + str(e))

    def create_message(self, content, thread, by):
        return Message.objects.create(content=content, thread=thread, by=by)