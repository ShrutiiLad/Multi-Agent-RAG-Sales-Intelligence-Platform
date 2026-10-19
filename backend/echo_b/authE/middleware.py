import structlog
from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from authE.models import TokenUsage
import dotenv
import os

dotenv.load_dotenv()



class TokenUsageMiddleware(MiddlewareMixin):
    def process_request(self, request):
        logger = structlog.get_logger()
        if not hasattr(request, '_token_usage_recorded'):
            auth = TokenAuthentication()
            user_and_token = auth.authenticate(request)
            logger.info(f"User and token Noted")
            if user_and_token:
                user, token = user_and_token
                today = timezone.now().date()  
                token_usage_exists = TokenUsage.objects.filter(token=token, used_at__date=today).exists()
                if not token_usage_exists:
                    TokenUsage.objects.create(token=token)
                    request._token_usage_recorded = True 