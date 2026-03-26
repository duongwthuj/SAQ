from decimal import Decimal

from django.db import transaction

from .clients import ClothesClient, CustomerClient, LaptopClient
from .models import Order, OrderItem


def _split_items_by_type(items):
    laptop_items = [i for i in items if i["product_type"] == "laptop"]
    clothes_items = [i for i in items if i["product_type"] == "clothes"]
    return laptop_items, clothes_items


def _get_client_for_type(product_type):
    if product_type == "laptop":
        return LaptopClient
    return ClothesClient


def create_order(customer_id, items, shipping_address):
    CustomerClient.validate_customer(customer_id)

    laptop_items, clothes_items = _split_items_by_type(items)

    products = {}
    if laptop_items:
        laptop_ids = [i["product_id"] for i in laptop_items]
        products.update({f"laptop_{k}": v for k, v in LaptopClient.get_products(laptop_ids).items()})
    if clothes_items:
        clothes_ids = [i["product_id"] for i in clothes_items]
        products.update({f"clothes_{k}": v for k, v in ClothesClient.get_products(clothes_ids).items()})

    for item in items:
        key = f"{item['product_type']}_{item['product_id']}"
        if key not in products:
            raise ValueError(f"Product not found: {item['product_type']} #{item['product_id']}")

    if laptop_items:
        stock_items = [{"product_id": i["product_id"], "quantity": i["quantity"]} for i in laptop_items]
        result = LaptopClient.check_stock(stock_items)
        if not result["all_in_stock"]:
            out = [d for d in result["details"] if not d["sufficient"]]
            raise ValueError(f"Insufficient laptop stock: {out}")
        LaptopClient.deduct(stock_items)

    if clothes_items:
        stock_items = [{"product_id": i["product_id"], "quantity": i["quantity"]} for i in clothes_items]
        result = ClothesClient.check_stock(stock_items)
        if not result["all_in_stock"]:
            out = [d for d in result["details"] if not d["sufficient"]]
            raise ValueError(f"Insufficient clothes stock: {out}")
        ClothesClient.deduct(stock_items)

    total = Decimal("0")
    order_items_data = []
    for item in items:
        key = f"{item['product_type']}_{item['product_id']}"
        product = products[key]
        unit_price = Decimal(str(product["price"]))
        qty = item["quantity"]
        total += unit_price * qty
        order_items_data.append({
            "product_id": item["product_id"],
            "product_type": item["product_type"],
            "product_name": product["name"],
            "unit_price": unit_price,
            "quantity": qty,
        })

    with transaction.atomic():
        order = Order.objects.create(
            customer_id=customer_id,
            status=Order.Status.CONFIRMED,
            total_amount=total,
            shipping_address=shipping_address,
        )
        for oi_data in order_items_data:
            OrderItem.objects.create(order=order, **oi_data)

    return order


def cancel_order(order):
    if order.status == Order.Status.CANCELLED:
        raise ValueError("Order is already cancelled.")
    if order.status in (Order.Status.SHIPPED, Order.Status.DELIVERED):
        raise ValueError("Cannot cancel shipped/delivered order.")

    for item in order.items.all():
        client = _get_client_for_type(item.product_type)
        client.restock(item.product_id, item.quantity)

    order.status = Order.Status.CANCELLED
    order.save(update_fields=["status", "updated_at"])
    return order
