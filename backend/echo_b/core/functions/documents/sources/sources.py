

from core.functions.globalFunctions import EchoLogging


class BaseRetrievalMechanism:
    def __init__(self, source):
        self.logger = EchoLogging()
        self.logger.log("Initializing BaseRetrievalMechanism")

    
