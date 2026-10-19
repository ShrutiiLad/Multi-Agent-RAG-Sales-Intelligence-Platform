# REF: https://techcommunity.microsoft.com/t5/fasttrack-for-azure/create-an-azure-openai-langchain-chromadb-and-chainlit-chat-app/ba-p/4024070
# REF: https://docs.chainlit.io/get-started/overview

import os
from django.core.wsgi import get_wsgi_application

settings_module = 'echo_b.deployment' if 'WEBSITE_HOSTNAME' in os.environ else 'echo_b.settings'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'echo_b.settings')
application = get_wsgi_application()
