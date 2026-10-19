# modules/user_stats.py
from chat.models import Thread
from django.utils import timezone
from authE.models import EchoUser, TokenUsage
from adminE.stats.statistics import BaseStats
from django.db.models import Count

class UserStats(BaseStats):
    """
    A class to calculate user statistics.
    Inherits from BaseStats which provides common utilities and setup.
    """
    def __init__(self,models):
        super().__init__(models)
        self.today = timezone.now().date()
        self.start_of_month = self.today.replace(day=1)
        self.thirty_days_ago = self.today - timezone.timedelta(days=30)

    def calculate_total_users(self):
        try:
            count = EchoUser.objects.count()
            return count
        except Exception as e:
            self.logger.log(f"An error occurred: {e}", exc_info=True)
            return None
        
    # def calculate_dau(self):
    #     today = timezone.now().date()
    #     dau_count = TokenUsage.objects.filter(used_at__date=today).count()
    #     return dau_count

    # def calculate_mau(self):
    #     today = timezone.now().date()
    #     thirty_days_ago = today - timezone.timedelta(days=30)
    #     mau_count = EchoUser.objects.filter(last_login__date__gte=thirty_days_ago).count()
    #     return mau_count


    def calculate_dau(self):
        try:
            unique_users_count = (
                TokenUsage.objects.filter(used_at__date=self.today)
                .values('token__user')
                .annotate(unique_count=Count('token__user', distinct=True))
                .count()
            )
            return unique_users_count
        except Exception as e:
            self.logger.log(f"An error occurred: {e}", exc_info=True)
            return None

    def calculate_mau(self):
        try:
            unique_users_count = (
                TokenUsage.objects.filter(used_at__date__gte=self.start_of_month)
                .values('token__user')
                .annotate(unique_count=Count('token__user', distinct=True))
                .count()
            )
            return unique_users_count
        except Exception as e:
            self.logger.log(f"An error occurred: {e}", exc_info=True)
            return None

class ContentStats(BaseStats):
    def content_creation_trends(self):
        pass

    def total_threads(self):
        try:
            count = Thread.objects.count()
            return count
        except Exception as e:
            self.logger.log(f"An error occurred: {e}", exc_info=True)
            return None
    
    def new_threads_last_month(self):
        try:
            previous_month, previous_year = self.get_previous_month()
            count = Thread.objects.filter(created_at__month=previous_month, created_at__year=previous_year).count()
            return count
        except Exception as e:
            self.logger.log(f"An error occurred: {e}", exc_info=True)
            return None
