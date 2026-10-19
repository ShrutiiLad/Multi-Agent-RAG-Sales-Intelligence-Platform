# Initialize structlog
import structlog
import os

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# IMP
# Don't remove Logging config which is commented, it's for future reference
# Ref: https://hodovi.cc/blog/django-development-and-production-logging/
# Ref: https://betterstack.com/community/guides/logging/structlog/#using-structlog-in-a-django-application

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json_formatter": {
            "()": structlog.stdlib.ProcessorFormatter,
            "processor": structlog.processors.JSONRenderer(),
        },
        "colored_console": {
            "()": structlog.stdlib.ProcessorFormatter,
            "processor": structlog.dev.ConsoleRenderer(colors=True),
        },
        # "plain_console": {
        #     "()": structlog.stdlib.ProcessorFormatter,
        #     "processor": structlog.dev.ConsoleRenderer(),
        # },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "colored_console",
        },
        "json_file": {
            "class": "logging.handlers.WatchedFileHandler",
            "filename": os.path.join(BASE_DIR, "logs", "json.log"),
            "formatter": "json_formatter",
        },
    },
    "loggers": {
        # "django_structlog": {
        #     "handlers": ["console", "json_file"],
        #     "level": "DEBUG",
        # },
        # "django_structlog.middlewares": {
        #     "handlers": ["console"],
        #     "level": "DEBUG",
        # },
      
        'django.channels': {  # Adjust the logger name based on the actual logger that logs the message
            'handlers': ['console'],
            'level': 'DEBUG',
        },   
        'django': {
            'handlers': ['console'],
            'level': 'INFO',  
            'propagate': True,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.server': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
        "root": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
    },
}


structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.filter_by_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
        # structlog.processors.format_exc_info,
        # structlog.processors.dict_tracebacks,
        # structlog.processors.JSONRenderer(),
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)


# Ensure the log directory exists
# TODO: Logs are retained in JSON file if this config is added in settings.py, but doesn't work if added in log_config.py. Need to investigate.
os.makedirs(os.path.join(BASE_DIR, "logs"), exist_ok=True)