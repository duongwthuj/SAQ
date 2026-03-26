from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product_id", "product_type", "product_name", "unit_price", "quantity", "line_total")
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "customer_id", "status", "total_amount", "shipping_address", "items", "created_at", "updated_at")
        read_only_fields = ("id", "status", "total_amount", "created_at", "updated_at")


class OrderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("id", "customer_id", "status", "total_amount", "created_at")


class CreateOrderItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_type = serializers.ChoiceField(choices=OrderItem.ProductType.choices)
    quantity = serializers.IntegerField(min_value=1)


class CreateOrderSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField()
    items = CreateOrderItemSerializer(many=True, min_length=1)
    shipping_address = serializers.CharField()


class UpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
