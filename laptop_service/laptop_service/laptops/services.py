from django.db import transaction
from django.db.models import F

from .models import Inventory


def check_stock(items):
    details = []
    all_ok = True
    for item in items:
        try:
            inv = Inventory.objects.get(laptop_id=item["product_id"])
            available = inv.available
            ok = available >= item["quantity"]
        except Inventory.DoesNotExist:
            available = 0
            ok = False
        if not ok:
            all_ok = False
        details.append(
            {
                "product_id": item["product_id"],
                "requested": item["quantity"],
                "available": available,
                "sufficient": ok,
            }
        )
    return all_ok, details


@transaction.atomic
def deduct_stock(items):
    results = []
    for item in items:
        inv = Inventory.objects.select_for_update().get(laptop_id=item["product_id"])
        if inv.available < item["quantity"]:
            raise ValueError(
                f"Insufficient stock for laptop {item['product_id']}: "
                f"available={inv.available}, requested={item['quantity']}"
            )
        inv.quantity = F("quantity") - item["quantity"]
        inv.save(update_fields=["quantity"])
        inv.refresh_from_db()
        results.append(
            {
                "product_id": item["product_id"],
                "deducted": item["quantity"],
                "remaining": inv.quantity,
            }
        )
    return results


@transaction.atomic
def restock(product_id, quantity):
    inv = Inventory.objects.select_for_update().get(laptop_id=product_id)
    inv.quantity = F("quantity") + quantity
    inv.save(update_fields=["quantity"])
    inv.refresh_from_db()
    return {"product_id": product_id, "new_quantity": inv.quantity}
