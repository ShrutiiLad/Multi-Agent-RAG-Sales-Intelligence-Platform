import json
import logging
from functools import wraps
import traceback
from uuid import UUID
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from django.apps import apps
import dotenv
import os
import structlog

def getErrorLogModel():
    return apps.get_model('chat', 'ErrorLog')

dotenv.load_dotenv()


class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        return super().default(obj)
    
class EchoLogging:

    def __init__(self):
        self.logger = structlog.get_logger()

    def log(self, message, exc_info=False): # Add exc_info parameter
        self.logger.debug("-" * 70)
        self.logger.debug(message)
        if exc_info: 
            self.logger.debug(traceback.format_exc())
        self.logger.debug("-" * 70)

class ErrorHandler:
    echo_logging = EchoLogging()

    @staticmethod
    def logAndHandleErrors(operation):
        """Enhanced decorator to handle errors more granularly."""
        @wraps(operation)
        def wrapper(*args, **kwargs):
            try:
                return operation(*args, **kwargs)
            except ValueError as ve:
                ErrorHandler.echo_logging.log(f"Validation error in {operation.__name__}: {ve}")
                return {"error": "Invalid input. Please check your data and try again."}
            except TypeError as te:
                ErrorHandler.echo_logging.log(f"Type error in {operation.__name__}: {te}")
                return {"error": "Type mismatch. Please check your data types and try again."}
            except KeyError as ke:
                ErrorHandler.echo_logging.log(f"Key error in {operation.__name__}: {ke}")
                return {"error": "Missing key in the input data. Please check your data and try again."}
            except Exception as e:
                error_context = kwargs.get('context', 'No context provided')
                ErrorHandler.echo_logging.log(f"Unexpected error during {operation.__name__}: {e}, Context: {error_context}")
                getErrorLogModel().objects.create(type=operation.__name__, error=str(e), message=error_context)
                return ErrorHandler.get_error_response(operation.__name__)
        return wrapper

    @staticmethod
    def get_error_response(operation_name):
        """Provide a generic error message or specific ones based on the operation."""
        if operation_name in ['create_message_obj', 'create_message']:
            return {"error": "Couldn't process your request. Please try again later."}
        else:
            return {"error": "An unexpected error occurred. Our team has been notified."}