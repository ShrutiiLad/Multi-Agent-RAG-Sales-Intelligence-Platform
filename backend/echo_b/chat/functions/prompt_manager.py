from core.functions.bots.prompts.promptGallery import template_rag, template_general, template_interview
import logging

from chat.models import QueryCategory
from core.functions.globalFunctions import EchoLogging, ErrorHandler


logger = EchoLogging()

class PromptManager:
    
    def __init__(self, rag=True, interview = False):
        self.rag = rag
        if rag:
            logger.log("Selected RAG")
            self.template = template_rag
            if interview:
                logger.log("Selected Interview")
                self.template = template_interview
        else:
            logger.log("Selected General")
            self.template = template_general

    @ErrorHandler.logAndHandleErrors
    def formatInterviewInstructions(self, query, interview_context="No context, use your knowledge"):
        template_data = {
            "user_query": query,
        }
        template_data["interview_context"] = interview_context
        formatted_instructions = self.template.format(**template_data)
        logging.info(f"PROMPT SENT TO THE BOT FOR INTERVIEW: {formatted_instructions}")
        return formatted_instructions

    @ErrorHandler.logAndHandleErrors
    def formatInstructions(self, query, rag_context="No context, use your knowledge"):
        template_data = {
            "user_query": query,
        }
        if self.rag:
            template_data["context"] = rag_context
        else:
            logging.info("Non-RAG scenario")
            pass

        formatted_instructions = self.template.format(**template_data)
        logging.info(f"PROMPT SENT TO THE BOT: {formatted_instructions}")
        return formatted_instructions

    @ErrorHandler.logAndHandleErrors
    def getRelevantTemplate(self, query:str, context:str,interview:bool):
        if interview:
            return self.formatInterviewInstructions(query,context)
        else:
            return self.formatInstructions(query,context)
