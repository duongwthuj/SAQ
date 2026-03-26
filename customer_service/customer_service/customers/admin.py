from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(BaseUserAdmin):
    list_display = ("username", "email", "phone", "is_active")
    fieldsets = BaseUserAdmin.fieldsets + (("Extra", {"fields": ("phone", "address")}),)
    add_fieldsets = BaseUserAdmin.add_fieldsets + (("Extra", {"fields": ("phone", "address")}),)
