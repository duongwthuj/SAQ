from django.db import models


class Inventory(models.Model):
    product_id = models.PositiveIntegerField(unique=True, db_index=True)
    quantity = models.PositiveIntegerField(default=0)
    reserved_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)

    class Meta:
        db_table = "inventory"
        verbose_name_plural = "inventory"

    @property
    def available(self):
        return self.quantity - self.reserved_quantity

    def __str__(self):
        return f"Product#{self.product_id}: {self.quantity} (reserved: {self.reserved_quantity})"
