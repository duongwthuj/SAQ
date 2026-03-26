from decimal import Decimal

from django.db import transaction

from .clients import InventoryClient, ProductClient, UserClient
from .models import Order, OrderItem


def create_order(user_id, items, shipping_address):
    """
    Orchestrate order creation:
    1. Validate user exists
    2. Fetch product info (prices)
    3. Check stock availability
    4. Deduct stock
    5. Create order + items
    """
    UserClient.validate_user(user_id)

    product_ids = [item["product_id"] for item in items]
    products = ProductClient.get_products(product_ids)

    missing = [pid for pid in product_ids if str(pid) not in products]
    if missing:
        raise ValueError(f"Products not found: {missing}")

    stock_items = [{"product_id": i["product_id"], "quantity": i["quantity"]} for i in items]
    stock_result = InventoryClient.check_stock(stock_items)
    if not stock_result["all_in_stock"]:
        out_of_stock = [d for d in stock_result["details"] if not d["sufficient"]]
        raise ValueError(f"Insufficient stock: {out_of_stock}")

    InventoryClient.deduct(stock_items)

    total = Decimal("0")
    order_items_data = []
    for item in items:
        product = products[str(item["product_id"])]
        unit_price = Decimal(str(product["price"]))
        qty = item["quantity"]
        total += unit_price * qty
        order_items_data.append({
            "product_id": item["product_id"],
            "product_name": product["name"],
            "unit_price": unit_price,
            "quantity": qty,
        })

    with transaction.atomic():
        order = Order.objects.create(
            user_id=user_id,
            status=Order.Status.CONFIRMED,
            total_amount=total,
            shipping_address=shipping_address,
        )
        for oi_data in order_items_data:
            OrderItem.objects.create(order=order, **oi_data)

    return order


def cancel_order(order):
    """Cancel order and restock items."""
    if order.status == Order.Status.CANCELLED:
        raise ValueError("Order is already cancelled.")
    if order.status in (Order.Status.SHIPPED, Order.Status.DELIVERED):
        raise ValueError("Cannot cancel shipped/delivered order.")

    for item in order.items.all():
        InventoryClient.restock(item.product_id, item.quantity)

    order.status = Order.Status.CANCELLED
    order.save(update_fields=["status", "updated_at"])
    return order
