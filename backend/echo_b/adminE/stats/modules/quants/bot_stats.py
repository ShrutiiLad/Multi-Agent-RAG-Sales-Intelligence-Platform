# modules/bot_stats.py
from django.db.models import (
    IntegerField, F, FloatField, ExpressionWrapper, Count, Case, When, Avg, Q, Value,Sum
)
from core.models import Bot
from chat.models import Thread, UserBotMessagePair, Feedback, Message
from adminE.stats.statistics import BaseStats
from django.db.models.functions import TruncDate, Coalesce
from django.conf import settings
from datetime import datetime, timedelta
from django.utils import timezone

from adminE.stats.modules.pricing.openai import OpenAIPricing
from authE.models import EchoUser
class BotStats(BaseStats):

    def get_average_per_user(self,total_cost):
        try:
            total_users = EchoUser.objects.count()
            return total_cost/total_users
        except Exception as e:
            self.logger.log(f"Error calculating average cost per user: {e}", exc_info=True)
            return None
        
    def get_average_price_per_bot(self,total_cost):
        try:
            total_bots = Bot.objects.count()
            return total_cost/total_bots
        except Exception as e:
            self.logger.log(f"Error calculating average cost per bot: {e}", exc_info=True)
            return None
        
    def get_average_price_per_prompt(self,total_cost):
        try:
            total_threads = Message.objects.filter(by='user').count()
            return total_cost/total_threads
        except Exception as e:
            self.logger.log(f"Error calculating average cost per thread: {e}", exc_info=True)
            return None
        
    
    def get_average_price_per_thread(self,total_cost):
        try:
            total_threads = Thread.objects.count()
            return total_cost/total_threads
        except Exception as e:
            self.logger.log(f"Error calculating average cost per thread: {e}", exc_info=True)
            return None


    def get_pricing_stats(self):
        total_cost = 0
        try:
            # Get the first day of the current month and the previous month
            first_day_current_month = datetime.now().replace(day=1)
            first_day_last_month = (first_day_current_month - timedelta(days=1)).replace(day=1)
            bots = Bot.objects.annotate(
                prompt_tokens=Coalesce(
                    Sum('thread__message__tokens', filter=Q(thread__message__by='user')),
                    Value(0)
                ),
                completion_tokens=Coalesce(
                    Sum('thread__message__tokens', filter=Q(thread__message__by='bot')),
                    Value(0)
                ),
                modelC = F('model__model_code'),
                avatarLink=F('avatar'),
                num_threads=Count('thread', distinct=True),
                num_users=Count('thread__user', distinct=True),
                current_month_tokens=Coalesce(
                    Sum('thread__message__tokens', filter=Q(thread__message__created_at__gte=first_day_current_month)),
                    Value(0)
                ),
                last_month_tokens=Coalesce(
                    Sum('thread__message__tokens', filter=Q(thread__message__created_at__gte=first_day_last_month, thread__message__created_at__lt=first_day_current_month)),
                    Value(0)
                )
            ).annotate(
                total_tokens=F('prompt_tokens') + F('completion_tokens'),
                token_increase_percentage=ExpressionWrapper(
                    Case(
                        When(last_month_tokens__gt=0,
                            then=(F('current_month_tokens') - F('last_month_tokens')) * 100.0 / F('last_month_tokens')),
                        default=Value(0),
                        output_field=FloatField()
                    ),
                    output_field=FloatField()
                )
            ).values('name', 'modelC','avatarLink', 'total_tokens', 'num_threads', 'num_users', 'token_increase_percentage', 'prompt_tokens', 'completion_tokens')

            bot_pricing_stats = []
            bot_list = []

            for bot in bots:
                price = OpenAIPricing.openai_api_calculate_cost(bot, model=bot['modelC'])
                total_cost += price
                bot_usage = {
                    'prompt_tokens': bot['prompt_tokens'],
                    'completion_tokens': bot['completion_tokens'],
                }
                self.logger.log(f"Bot usage: {bot['modelC']}")

                bot_list.append({
                    'name': bot['name'],
                    'avatar': f"{settings.MEDIA_URL}{bot['avatarLink']}" if bot['avatarLink'] else None,
                    'tokens': bot['total_tokens'],
                    'pricing': OpenAIPricing.openai_api_calculate_cost(bot_usage, model=bot['modelC']),
                    'num_threads': bot['num_threads'],
                    'num_users': bot['num_users'],
                    'token_increase_percentage': bot['token_increase_percentage']
                })

            average_per_user = self.get_average_per_user(total_cost)
            average_per_bot = self.get_average_price_per_bot(total_cost)
            average_per_prompt = self.get_average_price_per_prompt(total_cost)
            average_per_thread = self.get_average_price_per_thread(total_cost)

            bot_pricing_stats.append({
                'admin':{
                    'total_cost': total_cost,
                    'average_per_user': average_per_user,
                    'average_per_bot': average_per_bot,
                    'average_per_prompt': average_per_prompt,
                    'average_per_thread': average_per_thread
                }
                })
            
            bot_pricing_stats.append({
                'bot_list': bot_list
            })
            return bot_pricing_stats
        except Exception as e:
            self.logger.log(f"Error calculating pricing stats: {e}", exc_info=True)
            return None


    def tokens_used_per_bot(self):
        try:
            tokens_used = Message.objects.values('thread__assistant__name').annotate(
                total_tokens=Coalesce(F('tokens'), Value(0))
            ).order_by('thread__assistant__name')
            return list(tokens_used)
        except Exception as e:
            self.logger.log(f"Error calculating tokens used per bot: {e}", exc_info=True)
            return None

    def number_of_threads_per_bot(self):
        try:
            threads_counts = Message.objects.filter(by='bot').values('thread__assistant__name').annotate(
                thread_count=Count('thread', distinct=True)
            ).order_by('-thread_count')
            return list(threads_counts)
        except Exception as e:
            self.logger.log(f"Error calculating number of threads per bot: {e}", exc_info=True)
            return None
        
    def average_response_time(self):
        try:
            avg_response_time = UserBotMessagePair.objects.annotate(
                response_time_diff=F('response_time')
            ).aggregate(avg_response_time=Avg('response_time_diff'))

            return avg_response_time.get('avg_response_time')
        except Exception as e:
            self.logger.log(f"Error calculating average response time: {e}", exc_info=True)
            return None


    def bot_success_rate(self):
        try:
            positive_feedback_count = Feedback.objects.filter(positive=True).count()
            total_feedback_count = Feedback.objects.all().count()

            success_rate = (positive_feedback_count / total_feedback_count) * 100 if total_feedback_count else 0
            return success_rate
        except Exception as e:
            self.logger.log(f"Error calculating bot success rate: {e}", exc_info=True)
            return None

    def most_used_bots(self):
        try:
            usage_counts = Message.objects.filter(by='bot').values('thread__assistant__name').annotate(
            usage_count=Count('id')
            ).order_by('-usage_count')[:5]
            return list(usage_counts)
        except Exception as e:
            self.logger.log(f"Error calculating most used bots: {e}", exc_info=True)
            return None

    def messages_created_per_bot_evolution(self):
        try:
            messages_evolution = Message.objects.filter(by='bot').annotate(
                date=TruncDate('created_at')
            ).values('thread__assistant__name', 'date').annotate(
                message_count=Count('id')
            ).order_by('thread__assistant__name', 'date')
            return list(messages_evolution)
        except Exception as e:
            self.logger.log(f"Error calculating messages created per bot evolution: {e}", exc_info=True)
            return None

    def all_bot_stats(self):
        previous_month = (timezone.now().replace(day=1) - timezone.timedelta(days=1)).month
        previous_year = (timezone.now().replace(day=1) - timezone.timedelta(days=1)).year
        current_month = timezone.now().month
        current_year = timezone.now().year
        self.logger.log(f"{previous_month}, {previous_year}, {current_month}, {current_year}")
        try:
            self.logger.log("Calculating all bot stats")
            bot_stat_ratios = Message.objects.filter(by='bot').values('thread__assistant__name').annotate(
                positive_feedback_count=Count('bot_pairs__feedback__positive'),
                negative_feedback_count=Count(
                    Case(
                        When(bot_pairs__feedback__positive=False, then=1),
                        output_field=IntegerField(),
                    )
                ),
                previous_month_count=Count('id', filter=Q(created_at__month=previous_month, created_at__year=previous_year)),
                current_month_count=Count('id', filter=Q(created_at__month=current_month, created_at__year=current_year)),
                thread_count=Count('thread', distinct=True),
                total_feedback_count=Count('bot_pairs__feedback'),
                avatar=F('thread__assistant__avatar'),
                average_response_time=Avg('bot_pairs__response_time'),  
            ).order_by('-thread_count')
            for item in bot_stat_ratios:
                if item['avatar']:
                    item['avatar'] = f"{settings.MEDIA_URL}{item['avatar']}"
            return [self.formatResult(bot) for bot in bot_stat_ratios]
        except Exception as e:
            self.logger.log(f"Error calculating feedback ratio per bot: {e}", exc_info=True)
            return None
    
    def formatResult(self, bot):
        name = bot['thread__assistant__name']
        positive_feedback_count = bot['positive_feedback_count']
        negative_feedback_count = bot['negative_feedback_count']
        previous_month_count = bot['previous_month_count']
        current_month_count = bot['current_month_count']
        evolution = self.calculate_increase_percentage(current_month_count, previous_month_count)
        thread_count = bot['thread_count']
        total_feedback_count = bot['total_feedback_count']
        negative_positive_ratio = self.feedback_ratio(negative_feedback_count, total_feedback_count)
        avatar = bot['avatar']
        average_response_time = bot['average_response_time']
        #Error rate has not been configured yet
        return {
            'name': name,
            'positive_feedback_count': positive_feedback_count,
            'negative_feedback_count': negative_feedback_count,
            'previous_month_count': previous_month_count,
            'current_month_count': current_month_count,
            'evolution': evolution,
            'thread_count': thread_count,
            'total_feedback_count': total_feedback_count,
            'negative_positive_ratio': negative_positive_ratio,
            'avatar': avatar,
            'average_response_time': average_response_time,
            'error_rate': 0
        }
    

    def calculate_increase_percentage(self, current_count, previous_count):
        try:
            self.logger.log(f"Calculating increase percentage for current: {current_count}, previous: {previous_count}")
            if previous_count > 0:
                return f"{((current_count - previous_count) / previous_count) * 100:.2f}%"
            return "First month"  # Handle no previous month data or division by zero
        except Exception as e:
            self.logger.log(f"Error calculating increase percentage: {e}", exc_info=True)
            return None
        
    def feedback_ratio(self,negative, total):
        try:
            if total == 0:
                return "No feedback submitted"
            return negative / total
        except Exception as e:
            self.logger.log(f"Error calculating feedback ratio: {e}", exc_info=True)
            return None
