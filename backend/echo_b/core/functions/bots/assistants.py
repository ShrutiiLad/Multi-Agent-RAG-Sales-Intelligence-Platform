import logging
from django.apps import apps
from django.core.exceptions import ObjectDoesNotExist
from dotenv import load_dotenv
from openai import OpenAI
from core.models import Project, Document  # Ensure these are imported correctly
from uuid import UUID

# THIS NEEDS REWORK
logger = logging.getLogger(__name__)  # Use a module-level logger

def get_bot_model():
    return apps.get_model('core', 'Bot')

def get_llm_model():
    return apps.get_model('core', 'Model')

load_dotenv()
class BotService:
    client = OpenAI()
    #CREATE API for EDIT, UPDATE when updating a bot would also update the relevant assistant on openai


    @classmethod
    def getBot(cls, id):
        botModel = get_bot_model()
        try:
            bot = botModel.objects.get(id=id)
            return bot
        except ObjectDoesNotExist as e:
            logger.error(f"Assistant with id {id} does not exist. Error: {e}")
            return None

    @classmethod
    def getBot(cls, id):
        botModel = get_bot_model()
        try:
            bot = botModel.objects.get(id=id)
            return bot
        except ObjectDoesNotExist as e:
            logger.error(f"Assistant with id {id} does not exist. Error: {e}")
            return None
    
    @classmethod
    def create_assistant(cls, name, instructions, model="gpt-3.5-turbo-1106", rules="Be professional",avatar=None, project_id=None, description=None, documents=[], type="discover", disabled=False, rag=True):
        bot_model = get_bot_model()
        logger.info("**" * 50)
        logger.info(f"DOCUMENT: {documents}")
        documents = [doc.id for doc in documents if doc is not None]
        logger.info("**" * 50)
        modelObj = get_llm_model().objects.get(model_code=model)
        project = Project.objects.get(id=project_id) if project_id else None
        bot = bot_model.objects.create(
            name=name,
            instructions=instructions,
            model=modelObj,
            rules=rules,
            project=project,
            description=description,
            type=type,
            disabled=disabled,
            rag=rag,
            avatar=avatar,
        )
        bot.documents.set(Document.objects.filter(id__in=documents))
        bot.save()
        return bot

    @classmethod
    def list_assistants(cls):
        bot_model = get_bot_model()
        return bot_model.objects.all()

    @classmethod
    def delete_assistant(cls, id):
        bot_model = get_bot_model()
        try:
            assistant = bot_model.objects.get(id=id)
            try:
                response = cls.client.beta.assistants.delete(assistant.openAiAssistantId)
                assistant.delete()
            except Exception as e:
                logger.error(f"Failed to delete assistant {assistant.openAiAssistantId}: {response}")
                return False
            return True
        except bot_model.DoesNotExist as e:
            logger.error(f"Assistant with id {id} does not exist. Error: {e}")
            return False

    @classmethod
    def edit_assistant(cls, id, name=None, instructions=None, model=None, project_id=None, description=None, documents_ids=None, type=None, disabled=None, rag=None):
        bot_model = get_bot_model()
        try:
            bot = bot_model.objects.get(id=UUID(id))
            if name:
                bot.name = name
            if instructions:
                bot.instructions = instructions
            if model:
                modelObj = get_llm_model().objects.get(model_code=model)
                bot.model = modelObj
            if project_id is not None:
                bot.project = Project.objects.get(id=project_id) if project_id else None
            if description is not None:
                bot.description = description
            if documents_ids is not None:
                documents = Document.objects.filter(id__in=documents_ids)
                bot.documents.set(documents)
            if type is not None:
                bot.type = type
            if disabled is not None:
                bot.disabled = disabled
            if rag is not None:
                bot.rag = rag
            bot.save()
            return bot  # Return the updated object
        except bot_model.DoesNotExist as e:
            logger.error(f"Error occurred while editing assistant with id {id}: {e}")
            return None
        