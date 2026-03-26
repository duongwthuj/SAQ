from django.apps import AppConfig


class LaptopsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "laptop_service.laptops"
    label = "laptops"
