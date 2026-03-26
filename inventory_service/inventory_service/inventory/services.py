from django.db import transaction
from django.db.models import F

from .models import Inventory


def check_stock(items):
    """Check if all items have sufficient stock. Returns (ok, details)."""
    details = []
    all_ok = True
    for item in items:
        try:
            inv = Inventory.objects.get(product_id=item["product_id"])
            available = inv.available
            ok = available >= item["quantity"]
        except Inventory.DoesNotExist:
            available = 0
            ok = False

        if not ok:
            all_ok = False
        details.append({
            "product_id": item["product_id"],
            "requested": item["quantity"],
            "available": available,
            "sufficient": ok,
        })
    return all_ok, details


@transaction.atomic
def deduct_stock(items):
    """Deduct stock for given items. Uses select_for_update to prevent race conditions."""
    results = []
    for item in items:
        inv = Inventory.objects.select_for_update().get(product_id=item["product_id"])
        if inv.available < item["quantity"]:
            raise ValueError(
                f"Insufficient stock for product {item['product_id']}: "
                f"available={inv.available}, requested={item['quantity']}"
            )
        inv.quantity = F("quantity") - item["quantity"]
        inv.save(update_fields=["quantity"])
        inv.refresh_from_db()
        results.append({
            "product_id": item["product_id"],
            "deducted": item["quantity"],
            "remaining": inv.quantity,
        })
    return results


@transaction.atomic
def restock(product_id, quantity):
    """Add stock back for a product."""
    inv, created = Inventory.objects.select_for_update().get_or_create(
        product_id=product_id,
        defaults={"quantity": quantity},
    )
    if not created:
        inv.quantity = F("quantity") + quantity
        inv.save(update_fields=["quantity"])
        inv.refresh_from_db()
    return {"product_id": product_id, "new_quantity": inv.quantity}
