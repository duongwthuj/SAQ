from django.urls import path

from . import views

urlpatterns = [
    path("categories/", views.CategoryListCreateView.as_view()),
    path("", views.LaptopListCreateView.as_view()),
    path("<int:pk>/", views.LaptopDetailView.as_view()),
    path("inventory/", views.InventoryCreateView.as_view()),
    path("inventory/<int:laptop_id>/", views.InventoryDetailView.as_view()),
    path("internal/laptops/<int:pk>/", views.InternalLaptopView.as_view()),
    path("internal/laptops/bulk/", views.InternalLaptopBulkView.as_view()),
    path("internal/inventory/check-stock/", views.CheckStockView.as_view()),
    path("internal/inventory/deduct/", views.DeductStockView.as_view()),
    path("internal/inventory/restock/", views.RestockView.as_view()),
]
