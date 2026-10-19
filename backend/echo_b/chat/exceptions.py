# In a new file exceptions.py
class AssistantExecutionError(Exception):
    """Exception raised for errors during the execution of an OpenAI Assistant."""
    def __init__(self, message="An error occurred with the Assistant"):
        self.message = message
        super().__init__(self.message)
