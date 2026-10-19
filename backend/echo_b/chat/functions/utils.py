# file: echo_b/chat/utils.py
import uuid
from dotenv import load_dotenv
from langchain.agents.openai_assistant import OpenAIAssistantRunnable
from channels.db import database_sync_to_async
from langchain_community.callbacks import get_openai_callback
from chat.functions.context import ContextEmbedder
from chat.functions.prompt_manager import PromptManager
from core.models import Bot, Document
from core.functions.globalFunctions import EchoLogging, ErrorHandler
from ..models import  Thread, Message, UserBotMessagePair
from django.db import transaction
from asgiref.sync import sync_to_async

load_dotenv()













#########################################################################[DEPRECATED]#####################################################################################






logger = EchoLogging()
# Core Functionalities
@ErrorHandler.logAndHandleErrors
def create_message_obj(context, tokens, by, thread, sources={}):
    """Create a message object in the database."""
    logger.log(f"Creating message object for {by} in thread {thread.id}")
    message = Message.objects.create(
        content=context, 
        tokens=tokens, by=by, thread=thread, 
        sources = sources)
    return message

@ErrorHandler.logAndHandleErrors
def create_pair(user_message, bot_message):
    """Create a pair of messages in the database."""
    return UserBotMessagePair.objects.create(user_message=user_message, bot_message=bot_message)

@ErrorHandler.logAndHandleErrors
def execute_agent(echoBot, message, threadId = None, user = None):
    """Execute the agent and process its response."""
    try:
        openAIAssistant = OpenAIAssistantRunnable(assistant_id=echoBot.openAiAssistantId)
        echoBot = Bot.objects.get(openAiAssistantId=echoBot.openAiAssistantId)
        logger.log(f"Creating thread for : {echoBot}")
        if threadId:
            message = {"content": message, "thread_id": threadId}
        else:
            message = {"content": message}
        logger.log(f"EXECUTING AGENT: {echoBot.openAiAssistantId} - {message} - {threadId} - {user if user else 'No User'}")
        with get_openai_callback() as cb:
            response = openAIAssistant.invoke(message)
            logger.log(f"RESPONSE: {response}")
            thread_id = response[0].thread_id
            content_text = response[0].content[0].text.value if response[0].content else None
            logger.log(f"RESPONSE: {content_text}")
            logger.log(f"THREAD_ID: {cb}")
        logger.log(f"THREAD_ID: {threadId}")
        if threadId:
            thread = Thread.objects.get(thread_id=threadId)
        else:
            thread = Thread.objects.create(thread_id=thread_id, assistant=echoBot, user=user, title=content_text[:15])
        logger.log(f"THREAD: {thread.id} - {thread.created_at if thread.created_at else 'Not Created'}")
        return content_text, thread, cb
    except Exception as e:
        logger.log(f"Error in execute_agent: {e}", exc_info=True)
        return None, None, None

@ErrorHandler.logAndHandleErrors
async def createContext(query, assistant, in_depth=False, interview=False, mega=False):
    logger.log(f"Creating context for query:interview: {interview}, in_depth: {in_depth}, mega: {mega}")
    try:
        if assistant.rag:
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

            if assistant.rag:
                logger.log(f"Assistant is RAG. Creating sources.")
                sources = _createSource(summary,interview)
            else:
                logger.log(f"Assistant is not RAG. No sources created.")
                sources = []
            return promptWithContext, sources
        else:
            return query, []
    except Exception as e:
        logger.log(f"Error in createContext: {e}", exc_info=True)
        return query, []


@ErrorHandler.logAndHandleErrors
def _createSource(summary, interview):
    """
    Returns a list of source objects.
    """
    # Initialize the list for storing source objects
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

# @ErrorHandler.logAndHandleErrors
# @transaction.atomic
async def createMessage(assistant, query, threadId=None, user= None, inDepth=False, interview = False, mega=False):
    """
    Create a new message and potentially a new thread.
    If threadId is provided, the message is added to the existing thread.
    Returns a dictionary with the response and the thread_id.
    """
    try:
        logger.log(f"Creating message for query: {query}")
        if assistant.rag:
            logger.log(f"Assistant is RAG. Creating context.")
            logger.log(f"THESE ARE THINGS COMING TO ME: interview: {interview}, in_depth: {inDepth}, mega: {mega}")
            # message, sources = sync_to_async(createContext(query, assistant, in_depth=inDepth, interview=interview, mega=mega))
            result =await createContext(query, assistant, in_depth=inDepth, interview=interview, mega=mega)
            message, sources = result
        else:
            logger.log(f"Assistant is not RAG. Creating context.")
            message = query
            sources = []
        logger.log(f"Message with context: {message}")
        response, thread, cb =await sync_to_async(execute_agent)(assistant, message, threadId=threadId, user=user)
        try:
            if response:
                user_message = await sync_to_async(create_message_obj)(query, cb.prompt_tokens, "user", thread)
                bot_message = await sync_to_async(create_message_obj)(response, cb.completion_tokens, "bot", thread, sources= sources)
                await sync_to_async(create_pair)(user_message, bot_message)
                logger.log(f"Message created: {bot_message}")
                return bot_message
            else:
                return {"error": "Couldn't respond to message. Please try again later.", "is_error": True}
        except Exception as e:
            logger.log(f"Error in create_message/Creating message pair: {e}" , exc_info=True)
    except Exception as e:
        logger.log(f"Error in create_message: {e}", exc_info=True)
        return {"error": f"Couldn't respond to message. Please try again later. Error: {str(e)}" , "is_error": True}

