from django.db.models import Count
from calendar import monthrange
from chat.models import Message, Thread
from adminE.stats.statistics import BaseStats
from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404

from core.models import Bot, Model

class MessageStats(BaseStats):
    def total_messages(self):
        try:
            total = Message.objects.count()
            self.logger.log(f"Total messages: {total}")
            return total
        except Exception as e:
            self.logger.log(f"Error fetching total messages count: {e}", exc_info=True)
            return None

    def messages_last_month(self):
        try:
            previous_month, previous_year = self.get_previous_month()
            total_in_month = Message.objects.filter(created_at__year=previous_year, created_at__month=previous_month).count()
            self.logger.log(f"Total messages last month: {total_in_month}")
            return total_in_month
        except Exception as e:
            self.logger.log(f"Error fetching total messages for the last month: {e}", exc_info=True)
            return None

    def messages_last_month_daily_average(self):
        try:
            previous_month, previous_year = self.get_previous_month()
            days_in_month = monthrange(previous_year, previous_month)[1]
            total_in_month = Message.objects.filter(created_at__year=previous_year, created_at__month=previous_month).count()
            daily_average = total_in_month / days_in_month
            self.logger.log(f"Daily average messages last month: {daily_average}")
            return daily_average
        except Exception as e:
            self.logger.log(f"Error calculating daily average messages for the last month: {e}", exc_info=True)
            return None

    def messages_by_purpose(self):
        try:
            purposes = Message.objects.values('purpose').annotate(total=Count('id')).order_by('-total')
            self.logger.log("Messages by purpose calculated.")
            return list(purposes)
        except Exception as e:
            self.logger.log(f"Error calculating messages by purpose: {e}", exc_info=True)
            return None

    def token_count(self):
        try:
            total_tokens = Message.objects.aggregate(total_tokens=Sum('tokens'))
            self.logger.log(f"Total tokens: {total_tokens['total_tokens']}")
            return total_tokens['total_tokens']
        except Exception as e:
            self.logger.log(f"Error calculating total tokens: {e}", exc_info=True)
            return None
        
    def token_count_by_category(self):
        try:
            tokens_by_purpose = Message.objects.values('classification__name').annotate(total_tokens=Sum('tokens')).order_by('-total_tokens')
            self.logger.log("Tokens by purpose calculated.")
            return list(tokens_by_purpose)
        except Exception as e:
            self.logger.log(f"Error calculating tokens by purpose: {e}", exc_info=True)
            return None
    
    def average_tokens_per_user(self):
        try:
            total_tokens_result = Message.objects.aggregate(total_tokens=Sum('tokens'))
            total_tokens = total_tokens_result['total_tokens']
            total_users = Thread.objects.values('user').distinct().count()
            if total_users == 0:
                average = 0
            else:
                average = total_tokens / total_users
            self.logger.log(f"Average tokens per user: {average}")
            return average
        except Exception as e:
            self.logger.log(f"Error calculating average tokens per user: {e}", exc_info=True)
            return None

    def average_tokens_per_message(self):
        try:
            total_tokens_result = Message.objects.aggregate(total_tokens=Sum('tokens'))
            total_tokens = total_tokens_result['total_tokens']
            total_messages = Message.objects.count()
            if total_messages == 0:
                average = 0
            else:
                average = total_tokens / total_messages
            self.logger.log(f"Average tokens per message: {average}")
            return average
        except Exception as e:
            self.logger.log(f"Error calculating average tokens per message: {e}", exc_info=True)
            return None
        

    def total_tokens_per_bot(self):
        try:
            tokens_by_bot = Message.objects.values('thread__assistant').annotate(total_tokens=Sum('tokens')).order_by('-total_tokens')
            for bot in tokens_by_bot:
                assistantUuid = bot['thread__assistant']
                if assistantUuid is not None:
                    assistant = get_object_or_404(Bot, id=assistantUuid)
                    botName = assistant.name 
                else:
                    botName = "deleted"
                total_tokens = bot['total_tokens']
                total_messages = Message.objects.filter(thread__assistant=assistantUuid).count()
                if total_messages == 0:
                    average = 0
                else:
                    average = total_tokens / total_messages

                bot['botName'] = botName 
                bot['averageTokens'] = average
            self.logger.log("Tokens and average tokens by bot calculated.")
            return list(tokens_by_bot)
        except Exception as e:
            self.logger.log(f"Error calculating tokens and average tokens by bot: {e}", exc_info=True)
            return None
            
    def total_tokens_per_model(self):
        try:
            tokens_by_model = Message.objects.values('thread__assistant__model').annotate(total_tokens=Sum('tokens')).order_by('-total_tokens')
            for model in tokens_by_model:
                self.logger.log(model)
                modelId = model['thread__assistant__model']
                if modelId is not None:
                    modelObj = get_object_or_404(Model, id=modelId)
                    model_code = modelObj.model_code 
                else:
                    model_code = "[DEP]"
                total_tokens = model['total_tokens']
                total_messages = Message.objects.filter(thread__assistant__model=modelId).count()
                if total_messages == 0:
                    average = 0
                else:
                    average = total_tokens / total_messages
                model['modelName'] = model_code
                model['averageTokens'] = average
            self.logger.log("Tokens and average tokens by model calculated.")
            return list(tokens_by_model)
        except Exception as e:
            self.logger.log(f"Error calculating tokens and average tokens by model: {e}", exc_info=True)
            return None

