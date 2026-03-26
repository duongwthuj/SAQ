from rest_framework import serializers

from .models import Category, ClothingItem, Inventory


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "parent")


class ClothingItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, allow_null=True)

    class Meta:
        model = ClothingItem
        fields = (
            "id",
            "name",
            "slug",
            "brand",
            "price",
            "description",
            "size",
            "color",
            "material",
            "category",
            "category_name",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("slug", "created_at", "updated_at")


class ClothingItemListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, allow_null=True)

    class Meta:
        model = ClothingItem
        fields = (
            "id",
            "name",
            "slug",
            "brand",
            "price",
            "size",
            "color",
            "category",
            "category_name",
            "is_active",
        )
        read_only_fields = ("slug",)


class InventorySerializer(serializers.ModelSerializer):
    available = serializers.IntegerField(read_only=True)

    class Meta:
        model = Inventory
        fields = (
            "id",
            "item",
            "quantity",
            "reserved_quantity",
            "low_stock_threshold",
            "available",
        )


class StockCheckItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class StockCheckSerializer(serializers.Serializer):
    items = StockCheckItemSerializer(many=True)


class StockDeductSerializer(serializers.Serializer):
    items = StockCheckItemSerializer(many=True)


class RestockSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class InternalBulkIdsSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(min_value=1), allow_empty=False)
