from django.contrib import admin

from .models import Category, ClothingItem, Inventory


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "parent")
    search_fields = ("name", "slug")


@admin.register(ClothingItem)
class ClothingItemAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "brand", "price", "category", "is_active", "created_at")
    list_filter = ("is_active", "brand", "category")
    search_fields = ("name", "slug", "brand")


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("id", "item", "quantity", "reserved_quantity", "low_stock_threshold")
    search_fields = ("item__name",)
