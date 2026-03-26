from rest_framework import serializers

from .models import Category, Inventory, Laptop


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent"]


class LaptopSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Laptop
        fields = [
            "id",
            "name",
            "slug",
            "brand",
            "price",
            "description",
            "specs",
            "category",
            "category_name",
            "is_active",
            "created_at",
            "updated_at",
        ]


class LaptopListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Laptop
        fields = [
            "id",
            "name",
            "slug",
            "brand",
            "price",
            "category",
            "category_name",
            "is_active",
        ]


class InventorySerializer(serializers.ModelSerializer):
    available = serializers.ReadOnlyField()

    class Meta:
        model = Inventory
        fields = [
            "id",
            "laptop",
            "quantity",
            "reserved_quantity",
            "low_stock_threshold",
            "available",
        ]


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
