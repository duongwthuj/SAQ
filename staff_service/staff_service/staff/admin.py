from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Staff


@admin.register(Staff)
class StaffAdmin(BaseUserAdmin):
    list_display = ("username", "email", "department", "position", "is_active")
    fieldsets = BaseUserAdmin.fieldsets + (("Extra", {"fields": ("position", "department")}),)
    add_fieldsets = BaseUserAdmin.add_fieldsets + (("Extra", {"fields": ("position", "department")}),)
