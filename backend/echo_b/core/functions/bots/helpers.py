# file_path: echo_b/core/views.py
import logging
from dotenv import load_dotenv
import openai
from core.functions.globalFunctions import EchoLogging, ErrorHandler
from .prompts.promptGallery import system_rag_template, template_general

load_dotenv()

class OpenAIAssistantHandler:
    def __init__(self):
        self.client = self._get_openai_client()
        self.logger  = EchoLogging()
    
    @staticmethod
    @ErrorHandler.logAndHandleErrors
    def systemPrompt(instructions, rules):
        formatted_instructions = system_rag_template.format(
            instructions=instructions,
            rules=rules,
        )
        OpenAIAssistantHandler().logger.log(f"System prompt generated successfully")
        return formatted_instructions

    @ErrorHandler.logAndHandleErrors
    def listOAAssistants(self):
        try:
            assistants = self.client.beta.assistants.list(
                limit=100)
            return {"success": True, "assistants": assistants}
        except Exception as e:
            self.logger.log(f"Error in list_assistants: {e}", exc_info=True)
            return {"success": False, "error": e}
        

    @ErrorHandler.logAndHandleErrors
    def getOAAssistant(self, assistant_id):
        try:
            assistant = self.client.beta.assistants.retrieve(assistant_id)
            return {"success": True, "assistant": assistant}
        except Exception as e:
            self.logger.log(f"Error in get_assistant: {e}", exc_info=True)
            return {"success": False, "error": e}

    @ErrorHandler.logAndHandleErrors
    def _get_openai_client(self) -> openai.OpenAI:
        try:
            import openai
            return openai.OpenAI()
        except ImportError as e:
            raise ImportError(
                "Unable to import openai, please install with `pip install openai`."
            ) from e
        except AttributeError as e:
            raise AttributeError(
                "Please make sure you are using a v1.1-compatible version of openai. You "
                'can install with `pip install "openai>=1.1"`.'
            ) from e
        
    @ErrorHandler.logAndHandleErrors
    def createOAAssistant(self, **kwargs):
        try:
            agent = self.client.beta.assistants.create(**kwargs)
            return {"success": True, "assistant_id": agent.id}
        except Exception as e:
            self.logger.log(f"Error in create_assistant: {e}", exc_info=True)
            return {"success": False, "error": e}

    @ErrorHandler.logAndHandleErrors
    def updateOAAssistant(self, assistant_id, **kwargs):
        try:
            agent = self.client.beta.assistants.update(assistant_id, **kwargs)
            return {"success": True, "assistant_id": agent.id}
        except Exception as e:
            self.logger.log(f"Error in update_assistant: {e}", exc_info=True)
            return {"success": False, "error": e}

    @ErrorHandler.logAndHandleErrors
    def cleanDeleteOAAssistant(self,assistant_id):
        self.client.beta.assistants.delete(assistant_id)

    @ErrorHandler.logAndHandleErrors
    def deleteOAAssistant(self, assistant_id):
        try:
            self.client.beta.assistants.delete(assistant_id)
            return {"success": True}
        except Exception as e:
            self.logger.log(f"Error in deleteOAAssistant: {e}", exc_info=True)
            return {"success": False, "error": e}