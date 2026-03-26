from django.urls import path

from .views import OrderCancelView, OrderDetailView, OrderListCreateView, OrderUpdateStatusView

urlpatterns = [
    path("orders/", OrderListCreateView.as_view(), name="order-list-create"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<int:pk>/status/", OrderUpdateStatusView.as_view(), name="order-update-status"),
    path("orders/<int:pk>/cancel/", OrderCancelView.as_view(), name="order-cancel"),
]
