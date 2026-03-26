from django.contrib import admin

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "brand", "price", "category", "is_active")
    list_filter = ("brand", "category", "is_active")
    search_fields = ("name", "brand")
    prepopulated_fields = {"slug": ("name",)}
