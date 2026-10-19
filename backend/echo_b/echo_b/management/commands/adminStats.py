from django.apps import apps
from django.core.management.base import BaseCommand

from adminE.stats.statistics import BaseStats
from adminE.stats.modules.quants.user_stats import ContentStats, UserStats
from adminE.stats.modules.quants.chat_stats import MessageStats
from adminE.stats.modules.quants.bot_stats import BotStats
from adminE.stats.modules.quants.error_stats import ErrorFeedbackStats
from adminE.stats.modules.quants.document_stats import DocumentStats
from adminE.stats.modules.quants.category_stats import QueryCategoryStats
from core.functions.globalFunctions import EchoLogging


class Command(BaseCommand):
    """
    A management command to display various application statistics.
    """
    help = 'Displays various application statistics'
    logger = EchoLogging()
    def handle(self, *args, **options):
        models = apps.get_models()
        user_stats = UserStats(models)
        content_stats = ContentStats(models)
        bot_stats = BotStats(models)
        error_feedback_stats = ErrorFeedbackStats(models)
        document_stats = DocumentStats(models)
        message_stats = MessageStats(models)
        query_category_stats = QueryCategoryStats(models)

        self.logger.log(f"DAU: {user_stats.calculate_dau()}")
        self.logger.log(f"New Threads Last Month: {content_stats.new_threads_last_month()}")
        self.logger.log(f"Most Used Documents: {document_stats.total_documents()}")
        self.logger.log(f"Average Response Time: {bot_stats.average_response_time()}")
        self.logger.log(f"Bot Success Rate: {bot_stats.bot_success_rate()}")
        self.logger.log(f"Common Errors: {error_feedback_stats.common_errors()}")
        self.logger.log(f"Feedback Trends: {error_feedback_stats.feedback_trends()}")
        self.logger.log(f"Most Used Bots: {bot_stats.most_used_bots()}")
        self.logger.log(f"MAU: {user_stats.calculate_mau()}")
        self.logger.log(f"Content Creation Trends: {content_stats.content_creation_trends()}")
        self.logger.log(f"Total Threads: {content_stats.total_threads()}")
        self.logger.log(f"Documents by Category: {document_stats.documents_by_category()}")
        self.logger.log(f"Chat Stats: {message_stats.total_messages()}")
        self.logger.log(f"Query Category Stats: {query_category_stats.category_distribution()}")
        

# Path: echo_b/adminE/stats/show_stats.py

class AdminStats(BaseStats):
    """
    A class to aggregate all application statistics.
    """
    def __init__(self, models):
        super().__init__(models)
        self.bot_stats = BotStats(models)
        self.chat_stats = MessageStats(models)
        self.query_category_stats = QueryCategoryStats(models)
        self.document_stats = DocumentStats(models)
        self.error_feedback_stats = ErrorFeedbackStats(models)
        self.user_stats = UserStats(models)
        self.content_stats = ContentStats(models)

    def getAllStats(self):
        stats = {
            "totalUsers": self.user_stats.calculate_total_users(), 
            "DAU": self.user_stats.calculate_dau(),
            "MAU": self.user_stats.calculate_mau(),
            "newThreadsLastMonth": self.content_stats.new_threads_last_month(),
            "messagesLastMonth": self.chat_stats.messages_last_month(),
            "averageMessagesLastMonth": self.chat_stats.messages_last_month_daily_average(),
            "totalThreads": self.content_stats.total_threads(),
            "totalDocuments": self.document_stats.total_documents(),
            "documentsByCategory": self.document_stats.documents_by_category(),
            "totalMessages": self.chat_stats.total_messages(),
            "Messages by Purpose": self.chat_stats.messages_by_purpose(),
            "queryCategoryStats": self.query_category_stats.category_distribution(),
            "averageResponseTime": self.bot_stats.average_response_time(),
            "botSuccessRate": self.bot_stats.bot_success_rate(),
            "mostUsedBots": self.bot_stats.most_used_bots(),
            "commonErrors": self.error_feedback_stats.common_errors(),
            "feedbackTrends": self.error_feedback_stats.feedback_trends(),
            "contentCreationTrends": self.content_stats.content_creation_trends(),
        }
        return stats