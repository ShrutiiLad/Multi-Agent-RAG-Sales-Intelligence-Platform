# file: echo_b/chat/utilities.py
import uuid
from dotenv import load_dotenv
import logging
from channels.db import database_sync_to_async
from langchain.agents.openai_assistant import OpenAIAssistantRunnable
from langchain_text_splitters import RecursiveCharacterTextSplitter
from datetime import datetime
from chat.functions.context import ContextEmbedder
from chat.functions.prompt_manager import PromptManager
from core.models import Bot, Document
from core.functions.globalFunctions import EchoLogging, ErrorHandler
from chat.serializers import MessageSerializer
from chat.functions.contextFunctions.embedder import Embedder, retrieveAllAssociatedContext
from ..models import  QueryCategory, Thread, Message, UserBotMessagePair
from functools import wraps
from django.db import transaction
from asgiref.sync import sync_to_async

load_dotenv()

# Setup logging
logger = EchoLogging()

class DatabaseOperations:
    """Database operations for creating and retrieving objects."""
    @ErrorHandler.logAndHandleErrors
    def serializerMessageObj(messageObj):
        if messageObj:
            serializer = MessageSerializer(messageObj)
            serialized_data = serializer.data
            return serialized_data
        return None

    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def ensureISOFormatForDate(date):
        if date and not isinstance(date, str):
            return date.isoformat()
        return date

    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def create_or_edit_message_obj(context, tokens, by, thread, sources =[], classif=None, queryObj=None):
        try:
            if queryObj:
                queryObj.tokens = tokens
                if classif:
                    classification, _ = QueryCategory.objects.get_or_create(name=classif)
                    queryObj.classification = classification
                queryObj.save()
                return queryObj
            else:
                """Create a message object."""
                message = Message.objects.create(content=context, tokens=tokens, by=by, thread=thread, sources=sources)
                return message
        except Exception as e:
            logger.log(f"Error creating message by {by}: {e}", exc_info=True)
            return None

    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def create_pair(user_message, bot_message, tokens, responseTime=None):
        """Create a pair of messages."""
        try:
            logger.log(f"Creating message pair: {user_message} - {bot_message}, with an average response time of {responseTime}")
            return UserBotMessagePair.objects.create(user_message=user_message, bot_message=bot_message, tokens = tokens, response_time = responseTime)
        except Exception as e:
            logger.log(f"Error creating message pair: {e}", exc_info=True)
            return None
        
    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def get_or_create_thread(thread_id, assistant, user, query, openAIThreadId=None):
        """Get an existing thread or create a new one."""
        logger.log(f"Creating thread for : {assistant}")
        if thread_id:
            return Thread.objects.get(openAIThreadId=thread_id)
        else:
            return Thread.objects.create(openAIThreadId=openAIThreadId, assistant=assistant, user=user, title=query[:15])
        
    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def get_prev_message_content(thread):
        """Get the content of the previous message in the thread."""
        try:
            messages = thread.messages.filter(by="user")[-10:]
            content = ""
            for index, msg in messages:
                content += msg.content
            return [msg.content for msg in messages]
        except Exception as e:
            logger.log(f"Error getting previous message content: {e}", exc_info=True)
            return None

class AgentOperations:
    """Operations related to the interaction with OpenAI agents."""
    @ErrorHandler.logAndHandleErrors
    def initAgent(openaiAssistantId):
        try:
            agent = OpenAIAssistantRunnable(assistant_id=openaiAssistantId)
            return agent
        except Exception as e:
            logger.log(f"Error initializing OpenAI Assistant: {e}", exc_info=True)
            return None


    @ErrorHandler.logAndHandleErrors
    def getAgentVars(agent, message):
        import re
        def isInDepth(query):
            in_depth_phrases = ["in detail", "look more", "in-depth", "more information"]
            return any(re.search(fr'\b{re.escape(phrase)}\b', query, re.IGNORECASE) for phrase in in_depth_phrases)
        try:
            is_mega = agent.type == "mega"
            is_interview =agent.type in ["interview", "hybrid"]
            return isInDepth(message), is_mega, is_interview
        except Exception as e:
            """
            Respond in general query mode if there is an error in determining the query type.
            """
            return False, False, False

    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def simulateChunking(content):
        splitter = RecursiveCharacterTextSplitter(
            chunk_size = 10,
            chunk_overlap  = 5,
            length_function = len,
            keep_separator=True
        )
        texts = splitter.split_text(content)
        for split in texts:
            logger.log(f"SPLIT {split}")
        return texts


    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def invokeOpenAIAgent(agent, message):
        try:
            response = agent.invoke(message)
            content_text = response[0].content[0].text.value if response[0].content else None
            openAIThreadId = response[0].thread_id
            return content_text, openAIThreadId
        except Exception as e:
            logger.log(f"Error invoking OpenAI Assistant: {e}")
            raise ValueError("Internal server error during assistant invocation")


    @staticmethod
    @ErrorHandler.logAndHandleErrors
    @database_sync_to_async
    def createOpenAIThread(echoBot, thread):
        try:
            openAIAgent = AgentOperations.initAgent(echoBot.openAiAssistantId)
            openAIThread = openAIAgent.client.beta.threads.create()
            logger.log(f"Created OpenAI thread: {openAIThread}")
            logger.log(f"Thread ID: {openAIThread.id}")
            thread.openAIThreadId = openAIThread.id
            thread.save()
            return thread.openAIThreadId
        except Exception as e:
            logger.log(f"Error creating OpenAI thread: {e}", exc_info=True)
            raise ValueError("Internal server error during thread creation")
    

    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def executeAgent(assistant, message, threadId = None, user = None):
        from langchain_community.callbacks import get_openai_callback
        """Execute the agent and process its response."""
        try:
            agent = AgentOperations.initAgent(assistant.openAiAssistantId)
            assistant = Bot.objects.get(assistant_id=assistant.openAiAssistantId)
            if threadId:
                message = {"content": message, "thread_id": threadId}
            else:
                message = {"content": message}
            logger.log(f"EXECUTING AGENT: {assistant.openAiAssistantId} - {message} - {threadId} - {user if user else 'No User'}")
            with get_openai_callback() as cb:
                agentResponse, openAIThreadId = AgentOperations.invokeOpenAIAgent(agent, message, threadId=threadId)
            thread = DatabaseOperations.get_or_create_thread(threadId, assistant, user, agentResponse[:15], openAIThreadId=openAIThreadId)
            return agentResponse, thread, cb
        except Exception as e:
            logger.log(f"Error in execute_agent: {e}", exc_info=True)
            return None, None, None
        
class MessageCreationService:
    """
    Service class to handle creation of messages, including RAG and general messages.
    """
    @staticmethod
    @ErrorHandler.logAndHandleErrors
    async def createContext(query, assistant, in_depth=False, interview=False, mega=False, classification=None):
        """
        Create context for the query, including sources if applicable.
        :param query: The user query.
        :param assistant: The assistant object.
        :param in_depth: A flag indicating if the in-depth approach is used.
        :param interview: A flag indicating if the interview approach is used.
        :param mega: A flag indicating if the mega approach is used.
        :return: A tuple with the message and the sources.
        """
        logger.log(f"Creating context for query:interview: {interview}, in_depth: {in_depth}, mega: {mega}")
        try:
            if assistant.rag:
                if classification.name.lower() != "fluff":
                    logger.log(f"Assistant is RAG. Creating context.")
                    logger.log(f"interview: {interview}, in_depth: {in_depth}, mega: {mega}")
                    context_embedder = ContextEmbedder()
                    prompt_manager = PromptManager(rag=assistant.rag, interview=interview)
                    logger.log(f"Creating context for query: {query}")
                    collection = "interviews" if interview else "mega" if mega else "content" if in_depth else "summaries"
                    logger.log(f"Collection: {collection}")
                    summary =await context_embedder.get_content(assistant.id, query, collection=collection, in_depth=in_depth) 
                    if interview:
                        logger.log(f"Creating context for interview.")
                        promptWithContext = prompt_manager.formatInterviewInstructions(query, summary["content"])
                    else:
                        logger.log(f"Creating context for RAG.")
                        promptWithContext = query if in_depth or mega else prompt_manager.formatInstructions(query, summary["content"])
 
                    logger.log(f"Assistant is RAG. Creating sources.")
                    sources =await MessageCreationService.createSource(summary,interview)
                    return promptWithContext, sources
                else:
                    return query, []
            else:
                return query, []
        except Exception as e:
            logger.log(f"Error in createContext: {e}", exc_info=True)
            return query, []

    @staticmethod
    @ErrorHandler.logAndHandleErrors
    async def createNewContext(bot: Bot, query:str, isSourceNecessary:bool, interview:bool):
        """
        Create a new context for the assistant.
        """
        logger.log(f"Creating new context for bot: {bot}")
        promptManager = PromptManager(rag=bot.rag, interview = interview)
        logger.log(f"isSourceNecessary: {isSourceNecessary}, {type(isSourceNecessary)}")
        if bot.rag:
            # if isSourceNecessary or interview:
                logger.log(f"Creating new context for RAG bot.")
                try:
                    context, sourceIds = await retrieveAllAssociatedContext(bot, query)
                    query = promptManager.formatInterviewInstructions(query, context) if interview else promptManager.formatInstructions(query, context)
                    try:
                        sourceDicts = await MessageCreationService.createNewSources(sourceIds)
                        logger.log(f"Created new sources: {sourceDicts}")
                        return query, sourceDicts
                    except Exception as e:
                        logger.log(f"Error in creating new sources: {e}", exc_info=True)
                        return query, []
                except Exception as e:
                    logger.log(f"An error occurred while creating a new context: {e}", exc_info=True)
                    return query, []
            # else:
                logger.log(f"No source necessary for the RAG bot.")
                return query, []
        else:
            logger.log(f"IMP: {isSourceNecessary} - {interview}")
            logger.log(f"Creating new context for non-RAG bot.")
            return query,[]

    @staticmethod
    @ErrorHandler.logAndHandleErrors
    @database_sync_to_async
    def createSource(summary, interview):
        """
        Process summary information to construct source data for messages.
        
        :param summary: The summary information retrieved based on the query.
        :param is_rag: A flag indicating if the RAG approach is used.
        :return: A list of dictionaries, each representing a source.
        """
        message_source = []
        logger.log(f"Creating sources for summary: {summary}")
        def fetch_document(item_id):
            """
            Fetches the document from the database using its ID.
            """
            try:
                doc_id = uuid.UUID(item_id) if not interview else item_id
                docum = Document.objects.get(id=doc_id)
                return {"id": str(docum.id), "description": docum.summary, "title": docum.title, "strength": docum.strength}
            except Exception as e:
                logger.log(f"Error in fetching document ({item_id}): {e}")
                return None
        # Handle list of IDs in summary
        if isinstance(summary, dict) and isinstance(summary.get("id"), list):
            logger.log("Processing summary as a list.")
            unique_ids = set(summary["id"])
            for item_id in unique_ids:
                source = fetch_document(item_id)
                if source:
                    message_source.append(source)
        # Handle single ID in summary
        elif isinstance(summary, dict) and "id" in summary:
            logger.log("Processing summary as a single document.")
            source = fetch_document(summary["id"])
            if source:
                message_source.append(source)
        else:
            logger.log("Summary format is not recognized. Expected a list or a single document ID.")
        return message_source

    @staticmethod
    @ErrorHandler.logAndHandleErrors
    @database_sync_to_async
    def createNewSources(sources):
        logger.log(f"Creating new sources for documents: {sources}")
        def getDocument(doc_id):
            try:
                doc = Document.objects.get(id=doc_id)
                return {"id": str(doc.id), "description": doc.summary, "title": doc.title, "strength": doc.strength}
            except Exception as e:
                logger.log(f"Error in fetching document: {e}", exc_info=True)
                return None
        message_sources = []
        try:
            logger.log(f"Creating sources for documents: {sources}")
            for source in sources:
                message_sources.append(getDocument(source))
            
            return message_sources
        except Exception as e:
            logger.log(f"Error in createNewSources: {e}", exc_info=True)
            return []
        

    @ErrorHandler.logAndHandleErrors
    @transaction.atomic
    async def createMessage(assistant, query, threadId=None, user= None, in_depth=False, interview = False, mega=False):
        """
        Create a new message and potentially a new thread.
        If threadId is provided, the message is added to the existing thread.
        Returns a dictionary with the response and the thread_id.
        """
        try:
            logger.log(f"Creating message for query: {query}")
            if assistant.rag:
                logger.log(f"Assistant is RAG. Creating context.")
                message, sources = MessageCreationService.createContext(query, assistant, in_depth, interview, mega)
            else:
                logger.log(f"Assistant is not RAG. Creating context.")
                message = query
                sources = []
            logger.log(f"Message with context: {message}")
            response, thread, cb = sync_to_async(AgentOperations.executeAgent)(assistant, message, threadId=threadId, user=user)
            try:
                if response:
                    MessageCreationService._create_and_pair_messages(query, response, cb, thread, sources)
                else:
                    return {"error": "Couldn't respond to message. Please try again later.", "is_error": True}
            except Exception as e:
                logger.log(f"Error in create_message/Creating message pair: {e}" , exc_info=True)
        except Exception as e:
            logger.log(f"Error in create_message: {e}", exc_info=True)
            return {"error": f"Couldn't respond to message. Please try again later. Error: {str(e)}" , "is_error": True}


    @ErrorHandler.logAndHandleErrors
    @staticmethod
    @database_sync_to_async
    def _create_and_pair_messages(query,response, cb, thread, sources = [], serialized = False, runStartedTime = None, runCompletedTime = None, classification=None, queryObj=None):
        """
        Create message objects in the database and pair them.
        """
        logger.log(f"Creating and pairing messages.")
        logger.log(f"Sources in _create_and_pair_messages: {sources}")
        user_message = DatabaseOperations.create_or_edit_message_obj(query, cb.prompt_tokens, "user", thread, classif=classification, queryObj=queryObj)
        bot_message = DatabaseOperations.create_or_edit_message_obj(response, cb.completion_tokens, "bot", thread, sources=sources)
        runStartedTime = DatabaseOperations.ensureISOFormatForDate(runStartedTime)
        runCompletedTime = DatabaseOperations.ensureISOFormatForDate(runCompletedTime)
        responseTime = datetime.fromisoformat(runCompletedTime) - datetime.fromisoformat(runStartedTime) if runStartedTime and runCompletedTime else None
        DatabaseOperations.create_pair(user_message, bot_message, cb.total_tokens, responseTime=responseTime)
        return DatabaseOperations.serializerMessageObj(bot_message) if serialized else bot_message

