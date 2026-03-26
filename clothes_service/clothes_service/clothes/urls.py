from django.urls import path

from .views import (
    CategoryListCreateView,
    CheckStockView,
    ClothingItemDetailView,
    ClothingItemListCreateView,
    DeductStockView,
    InternalClothingItemBulkView,
    InternalClothingItemView,
    InventoryCreateView,
    InventoryDetailView,
    RestockView,
)

urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="category-list-create"),
    path("", ClothingItemListCreateView.as_view(), name="clothing-list-create"),
    path("<int:pk>/", ClothingItemDetailView.as_view(), name="clothing-detail"),
    path("inventory/", InventoryCreateView.as_view(), name="inventory-create"),
    path("inventory/<int:item_id>/", InventoryDetailView.as_view(), name="inventory-detail"),
    path("internal/clothes/<int:pk>/", InternalClothingItemView.as_view(), name="internal-clothing-detail"),
    path("internal/clothes/bulk/", InternalClothingItemBulkView.as_view(), name="internal-clothing-bulk"),
    path("internal/inventory/check-stock/", CheckStockView.as_view(), name="internal-check-stock"),
    path("internal/inventory/deduct/", DeductStockView.as_view(), name="internal-deduct-stock"),
    path("internal/inventory/restock/", RestockView.as_view(), name="internal-restock"),
]
