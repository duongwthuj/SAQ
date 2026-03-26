from django.db import transaction
from django.db.models import F

from .models import Inventory


def check_stock(items):
    details = []
    all_in_stock = True
    for row in items:
        product_id = row["product_id"]
        quantity = row["quantity"]
        try:
            inv = Inventory.objects.get(item_id=product_id)
        except Inventory.DoesNotExist:
            all_in_stock = False
            details.append({
                "product_id": product_id,
                "sufficient": False,
                "available": 0,
                "requested": quantity,
            })
            continue
        available = inv.available
        sufficient = available >= quantity
        if not sufficient:
            all_in_stock = False
        details.append({
            "product_id": product_id,
            "sufficient": sufficient,
            "available": available,
            "requested": quantity,
        })
    return {"all_in_stock": all_in_stock, "details": details}


@transaction.atomic
def deduct_stock(items):
    for row in items:
        product_id = row["product_id"]
        quantity = row["quantity"]
        inv = Inventory.objects.select_for_update().get(item_id=product_id)
        if inv.available < quantity:
            raise ValueError(f"Insufficient stock for product_id={product_id}")
        Inventory.objects.filter(pk=inv.pk).update(quantity=F("quantity") - quantity)


@transaction.atomic
def restock(product_id, quantity):
    inv = Inventory.objects.select_for_update().get(item_id=product_id)
    Inventory.objects.filter(pk=inv.pk).update(quantity=F("quantity") + quantity)
