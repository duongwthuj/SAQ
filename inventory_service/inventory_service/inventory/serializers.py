from rest_framework import serializers

from .models import Inventory


class InventorySerializer(serializers.ModelSerializer):
    available = serializers.IntegerField(read_only=True)

    class Meta:
        model = Inventory
        fields = ("id", "product_id", "quantity", "reserved_quantity", "low_stock_threshold", "available")
        read_only_fields = ("id",)


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
