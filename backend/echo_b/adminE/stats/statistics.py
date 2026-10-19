# modules/base.py


from django.utils import timezone
from core.functions.globalFunctions import EchoLogging


class BaseStats:
    """
    A base statistics class that other statistics classes will inherit from.
    Provides common utilities and setup.
    """
    def __init__(self, models):
        self.logger = EchoLogging()
        self.models = models

    def get_previous_month(self):
        now = timezone.now()
        if now.month == 1:
            previous_month = 12
            previous_year = now.year - 1
        else:
            previous_month = now.month - 1
            previous_year = now.year
        return previous_month, previous_year
