from django.urls import path

from .views import (
    CategoryListCreateView,
    InternalProductBulkView,
    InternalProductView,
    ProductDetailView,
    ProductListCreateView,
)

urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="category-list"),
    path("products/", ProductListCreateView.as_view(), name="product-list"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path("internal/products/<int:pk>/", InternalProductView.as_view(), name="internal-product"),
    path("internal/products/bulk/", InternalProductBulkView.as_view(), name="internal-product-bulk"),
]
