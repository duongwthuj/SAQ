from django.contrib import admin

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_id", "created_at", "updated_at")
    list_filter = ("created_at",)
    search_fields = ("customer_id",)
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("id", "cart", "product_id", "product_type", "product_name", "quantity", "unit_price")
    list_filter = ("product_type",)
