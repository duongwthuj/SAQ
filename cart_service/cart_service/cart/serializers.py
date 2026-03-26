from decimal import Decimal

from rest_framework import serializers

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product_id",
            "product_type",
            "product_name",
            "unit_price",
            "quantity",
            "line_total",
        )
        read_only_fields = fields


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = (
            "id",
            "customer_id",
            "items",
            "total",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_total(self, obj):
        total = Decimal("0")
        for item in obj.items.all():
            total += item.line_total
        return total


class AddToCartSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField(min_value=1)
    product_id = serializers.IntegerField(min_value=1)
    product_type = serializers.ChoiceField(choices=CartItem.ProductType.choices)
    quantity = serializers.IntegerField(min_value=1)


class UpdateCartItemSerializer(serializers.ModelSerializer):
    quantity = serializers.IntegerField(min_value=1)

    class Meta:
        model = CartItem
        fields = ("quantity",)


class ClearCartSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField(min_value=1)


class GetOrCreateCartSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField(min_value=1)
