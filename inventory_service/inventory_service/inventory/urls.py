from django.urls import path

from .views import (
    CheckStockView,
    DeductStockView,
    InventoryCreateView,
    InventoryDetailView,
    RestockView,
)

urlpatterns = [
    path("inventory/", InventoryCreateView.as_view(), name="inventory-create"),
    path("inventory/<int:product_id>/", InventoryDetailView.as_view(), name="inventory-detail"),
    path("internal/inventory/check-stock/", CheckStockView.as_view(), name="check-stock"),
    path("internal/inventory/deduct/", DeductStockView.as_view(), name="deduct-stock"),
    path("internal/inventory/restock/", RestockView.as_view(), name="restock"),
]
