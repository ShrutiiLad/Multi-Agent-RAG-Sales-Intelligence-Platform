
import asyncio
from dotenv import load_dotenv
from asgiref.sync import sync_to_async
from chat.models import QueryCategory
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from core.functions.bots.prompts.promptGallery import categorization_template
from chat.functions.utilities import ErrorHandler
from core.functions.globalFunctions import EchoLogging
from chat.functions.LLMFunctions.llm_settings import DEF_MODEL_FOR_NON_USER_TASK

load_dotenv()

@ErrorHandler.logAndHandleErrors
async def getClassification(query):
    try:
        handler = QueryClassifier()
        await handler.initialize()
        return await handler.handle_query(query)
    except Exception as e:
        EchoLogging().log(f"An error occurred while processing your query: {e}", exc_info=True)
        return f"An error occurred while processing your query: {e}"

@ErrorHandler.logAndHandleErrors
def getIsSourceNecessary(query):
    try:
        handler = QueryClassifier()
        return handler.process_source(query)
    except Exception as e:
        EchoLogging().log(f"An error occurred while processing your query: {e}", exc_info=True)
        return f"An error occurred while processing your query: {e}"


class QueryClassifier:
    config = [("QUERYCATEGORY", "Query Category"), ("SOURCE", "Source")]

    @staticmethod
    @ErrorHandler.logAndHandleErrors
    async def getCategories():
        def get_categories_sync():
            if QueryCategory.objects.all():
                return [cat.name for cat in QueryCategory.objects.all()]
            else:
                return []
        
        return await sync_to_async(get_categories_sync)()

    def __init__(self, config=None):
        """
        Initialize the UserQueryHandler class with optional configuration.

        :param config: A dictionary of configurations for query handling.
        """
        self.agent = ChatOpenAI(model=DEF_MODEL_FOR_NON_USER_TASK, max_tokens=20)
        self.config = config if config is not None else {}
        self.logger = EchoLogging()

    @ErrorHandler.logAndHandleErrors
    async def initialize(self):
        self.categories = await self.getCategories()
        
    @ErrorHandler.logAndHandleErrors
    def validate_query(self, query):
        """
        Validates the user query. This method can be extended to include
        more complex validation rules.

        :param query: The user query as a string.
        :return: True if the query is valid, False otherwise.
        """
        if not query or not isinstance(query, str):
            self.logger.log("Invalid query. Please provide a valid string.")
            return False
        self.logger.log("Query is valid.")
        return True
    
    @ErrorHandler.logAndHandleErrors
    def invokeOAAgent(self, prompt):
        try:
            return self.agent.invoke(prompt)
        except Exception as e:
            self.logger.log(f"An error occured while running LLMChain: {e}",exc_info=True)
            return None

    @ErrorHandler.logAndHandleErrors
    async def process_query(self, query):
        """
        Processes the user query. This is a placeholder method that can be
        customized based on specific requirements.

        :param query: The user query as a string.
        :return: The result of processing the query.
        """
        try:
            template = PromptTemplate(input_variables=["user_query","categories"],template=categorization_template,)
            prompt = template.format(user_query=query, categories=self.categories)
            self.logger.log(f"Prompt: {prompt}")
            try:
                classification = self.invokeOAAgent(prompt)
                classification = classification.content.strip()
                self.logger.log(f"Classification: {classification}")
                category =await self.getOrCreateQueryCategory(self._cleanString_(classification))
                return category
            except Exception as e:
                self.logger.log(f"An error occured while running LLMChain: {e}",exc_info=True)
                return f"error"
        except Exception as e:
            self.logger.log(f"An error occurred while processing your query: {e}", exc_info=True)
            return f"error"

    @ErrorHandler.logAndHandleErrors
    async def getOrCreateQueryCategory(self, classification):
        """
        Processes the user query. This is a placeholder method that can be customized based on specific requirements.

        :param query: The user query as a string.
        :return: The result of processing the query.

        """
        def get_or_create_sync():
            try:
                category,created = QueryCategory.objects.get_or_create(name=classification)
                return category, created
            except Exception as e:
                self.logger.log(f"An error occured while getting the category: {e}", exc_info=True)
                return None
             
        query, created = await sync_to_async(get_or_create_sync)()
        return query
    
    @ErrorHandler.logAndHandleErrors
    def process_source(self, query, previous_messages=None):
        """
        
        """
        if not self.validate_query(query):
            return "Invalid query. Please provide a valid string."
        try:
            # source_judgment = sourceJudge_template.format(previous_messages="What are the types of whiskey?", user_query="Can you tell me about Scotch whisky?")
            isSourceNecessary = self.agent.invoke(f"""Your job is to help a retrieval augmented generation 
                                                  large language model to determine 
                                                  if we need to look for sources for 
                                                  the given user query: {query}. 
                                                  Respond in python boolean""").content.strip()
            return isSourceNecessary.lower() == "true"
        except Exception as e:
            self.logger.log(f"An error occured while processing if the source is necessary : {e}", exc_info=True)
            return f"error"

    @ErrorHandler.logAndHandleErrors
    async def handle_query(self, query, config= None):
        """
        Main method to handle user queries. It validates the query and then
        processes it if valid. 

        :param query: The user query as a string.
        :return: The result of handling the query, or an error message if invalid.
        """
        
        if not self.validate_query(query):
            return "Invalid query. Please provide a valid string."
        try:
            queryCategory =await self.process_query(query)
            return queryCategory
        except Exception as e:
            self.logger.log(f"An error occurred while processing your query: {e}",exc_info=True)
            return f"An error occurred while processing your query: {e}", 0

    @ErrorHandler.logAndHandleErrors
    def _cleanString_(self,content):
        try:
            content = content.lower()
            content = content.replace("\n", "")
            content = content.replace("\t", "")
            content = content.replace("\r", "")
            content = content.strip()
            return content
        except Exception as e:
            self.logger.log(f"An error occurred while cleaning the string: {e}", exc_info=True)
            return content
    