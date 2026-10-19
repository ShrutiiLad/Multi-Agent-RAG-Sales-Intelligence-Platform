from adminE.stats.statistics import BaseStats
from chat.models import Message
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

class QueryCategoryStats(BaseStats):
    def category_distribution(self):
        try:
            return self.get_distribution_with_monthly_increase()
        except Exception as e:
            self.logger.log(f"Error calculating query category distribution: {e}", level='ERROR', exc_info=True)
            raise e  # Re-raise the exception after logging


    def get_distribution_with_monthly_increase(self):
        first_day_current_month, last_day_previous_month = self.calculate_month_boundaries()

        current_month_data = self.get_monthly_data(first_day_current_month, timezone.now())
        previous_month_data = self.get_monthly_data(last_day_previous_month.replace(day=1), last_day_previous_month)

        # Get bot type distribution alongside total counts
        distribution = Message.objects.values('classification__name').annotate(
            total=Count('id'),
            general_count=Count('id', filter=Q(thread__assistant__category='general')),
            role_count=Count('id', filter=Q(thread__assistant__category='role'))
        ).order_by('-total')

        return [self.format_result(category, current_month_data, previous_month_data) for category in distribution]

    def calculate_month_boundaries(self):
        current_date = timezone.now()
        first_day_current_month = current_date.replace(day=1)
        last_day_previous_month = first_day_current_month - timedelta(days=1)
        return first_day_current_month, last_day_previous_month

    def get_monthly_data(self, start_date, end_date):
        data = Message.objects.filter(created_at__range=[start_date, end_date])\
            .values('classification__name').annotate(total=Count('id'))
        return {item['classification__name']: item['total'] for item in data}

    def format_result(self, category, current_month_dict, previous_month_dict):
        name = category['classification__name']
        current_count = current_month_dict.get(name, 0)
        previous_count = previous_month_dict.get(name, 0)
        increase_percentage = self.calculate_increase_percentage(current_count, previous_count)
        total = category['total']
        general_count = category['general_count']
        role_count = category['role_count']
        role_ratio = (role_count / total) * 100 if total > 0 else 0  # Compute ratio of role type messages
        
        return {
           'classification_name': name,
            'total': total,
            'monthly_increase': increase_percentage,
            'general_count': general_count,
            'role_count': role_count,
            'role_ratio': f"{role_ratio:.2f}%"
        }

    def calculate_increase_percentage(self, current_count, previous_count):
        self.logger.log(f"Calculating increase percentage for current: {current_count}, previous: {previous_count}")
        if previous_count > 0:
            return f"{((current_count - previous_count) / previous_count) * 100:.2f}%"
        return "100%"  # Handle no previous month data or division by zero
