from django.contrib import admin

from .models import Inventory


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("product_id", "quantity", "reserved_quantity", "low_stock_threshold")
    search_fields = ("product_id",)
