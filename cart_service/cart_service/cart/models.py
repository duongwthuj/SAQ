from django.db import models


class Cart(models.Model):
    customer_id = models.PositiveIntegerField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "carts"

    def __str__(self):
        return f"Cart#{self.id} customer={self.customer_id}"


class CartItem(models.Model):
    class ProductType(models.TextChoices):
        LAPTOP = "laptop", "Laptop"
        CLOTHES = "clothes", "Clothes"

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product_id = models.PositiveIntegerField()
    product_type = models.CharField(max_length=20, choices=ProductType.choices)
    product_name = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "cart_items"
        unique_together = ("cart", "product_id", "product_type")

    @property
    def line_total(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"
