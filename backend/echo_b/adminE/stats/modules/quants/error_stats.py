# modules/error_stats.py
from django.db.models import Count
from chat.models import ErrorLog, Feedback
from adminE.stats.statistics import BaseStats

class ErrorFeedbackStats(BaseStats):
    """
    A class to calculate error and feedback statistics.
    """
    def common_errors(self):
        """
        Returns the top 5 most common errors.
        """
        try:
            common_errors = ErrorLog.objects.values('type').annotate(
            count=Count('id')
            ).order_by('-count')[:5]  # Top 5 most common errors

            return list(common_errors)
        except Exception as e:
            self.logger.log(f"An error occurred: {e}", exc_info=True)
            return []

    def feedback_trends(self):
        """
        Returns feedback trends over the last 6 months.
        """
        try:
            positive_feedback_count = Feedback.objects.filter(positive=True).count()
            negative_feedback_count = Feedback.objects.filter(positive=False).count()

            return {
            'positive_feedback_count': positive_feedback_count,
            'negative_feedback_count': negative_feedback_count,
            }
        except Exception as e:
            self.logger.log(f"An error occurred: {e}", exc_info=True)
            return {}