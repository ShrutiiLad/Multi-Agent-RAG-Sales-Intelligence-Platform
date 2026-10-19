from django.apps import AppConfig


class AutheConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authE'

    def ready(self):
        import authE.signals