from django.urls import path

from . import views

urlpatterns = [
    path("", views.CartDetailView.as_view(), name="cart-detail"),
    path("create/", views.GetOrCreateCartView.as_view(), name="cart-create"),
    path("add/", views.AddToCartView.as_view(), name="cart-add"),
    path("items/<int:pk>/", views.CartItemDetailView.as_view(), name="cart-item-detail"),
    path("clear/", views.ClearCartView.as_view(), name="cart-clear"),
    path("internal/<int:customer_id>/", views.InternalGetCartView.as_view(), name="internal-cart"),
]
