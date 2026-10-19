from django.apps import apps
from django.core.management.base import BaseCommand

from adminE.stats.statistics import BaseStats
from adminE.stats.modules.quants.chat_stats import MessageStats
from adminE.stats.modules.quants.bot_stats import BotStats
from core.functions.globalFunctions import EchoLogging



class Command(BaseCommand):
    """
    A management command to display various application statistics.
    """
    help = 'Displays various application statistics'
    logger = EchoLogging()
    def handle(self, *args, **options):
        models = apps.get_models()
        message_stats = MessageStats(models)
        self.logger.log(f"Total messages: {message_stats.total_messages()}")
        self.logger.log(f"Messages last month: {message_stats.messages_last_month()}")
        self.logger.log(f"Daily average messages last month: {message_stats.messages_last_month_daily_average()}")
        self.logger.log(f"Messages by purpose: {message_stats.messages_by_purpose()}")
        self.logger.log(f"Total tokens: {message_stats.token_count()}")
        self.logger.log(f"Token count by category: {message_stats.token_count_by_category()}")
        self.logger.log(f"Token count by user: {message_stats.average_tokens_per_user()}")
        self.logger.log(f"Token count by purpose: {message_stats.average_tokens_per_message()}")


class PricingStats(BaseStats):
    def __init__(self, models):
        super().__init__(models)
        self.chat_stats = MessageStats(models)
        self.bot_stats  = BotStats(models)

    def getPricingStats(self):
        try:
            daily_average_messages_last_month = self.chat_stats.messages_last_month_daily_average()
            messages_by_purpose = self.chat_stats.messages_by_purpose()
            total_tokens = self.chat_stats.token_count()
            token_count_by_category = self.chat_stats.token_count_by_category()
            average_tokens_per_user = self.chat_stats.average_tokens_per_user()
            average_tokens_per_message = self.chat_stats.average_tokens_per_message()
            total_tokens_per_bot = self.chat_stats.total_tokens_per_bot()
            total_tokens_per_model = self.chat_stats.total_tokens_per_model()
            return {
                "dailyAverageMessagesLastMonth": daily_average_messages_last_month,
                "messagesByPurpose": messages_by_purpose,
                "totalTokens": total_tokens,
                "tokenCountByCategory": token_count_by_category,
                "averageTokensPerUser": average_tokens_per_user,
                "averageTokensPerMessage": average_tokens_per_message,
                "totalTokensPerBot": total_tokens_per_bot,
                "totalTokensPerModel": total_tokens_per_model,
            }
        except Exception as e:
            self.logger.log(f"An error occurred: {e}", exc_info=True)
            return None
        
    def getPricingPerBot(self):
        try:
            pricing_stats = self.bot_stats.get_pricing_stats()
            return pricing_stats
        except Exception as e:
            self.logger.log(f"An error occurred: {e}", exc_info=True)
            return None
