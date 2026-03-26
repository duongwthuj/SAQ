import secrets
from decimal import Decimal, InvalidOperation

from django.conf import settings
from rest_framework import generics, mixins, status
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from .clients import ClothesClient, LaptopClient
from .models import Cart, CartItem
from .serializers import (
    AddToCartSerializer,
    CartSerializer,
    ClearCartSerializer,
    GetOrCreateCartSerializer,
    UpdateCartItemSerializer,
)


class IsInternalAPI(BasePermission):
    def has_permission(self, request, view):
        key = settings.INTERNAL_API_KEY or ""
        if not key:
            return False
        token = request.headers.get("X-Internal-Token") or ""
        return secrets.compare_digest(token, key)


def _cart_for_customer(customer_id: int):
    return (
        Cart.objects.filter(customer_id=customer_id)
        .prefetch_related("items")
        .order_by("-updated_at")
        .first()
    )


def _get_or_create_cart(customer_id: int) -> Cart:
    cart = _cart_for_customer(customer_id)
    if cart is None:
        cart = Cart.objects.create(customer_id=customer_id)
    return cart


def _product_snapshot(product_type: str, product_id: int):
    if product_type == CartItem.ProductType.LAPTOP:
        data = LaptopClient.get_laptop(product_id)
    else:
        data = ClothesClient.get_item(product_id)
    if not data:
        return None
    name = (
        data.get("product_name")
        or data.get("name")
        or data.get("title")
        or ""
    )
    raw_price = data.get("unit_price")
    if raw_price is None:
        raw_price = data.get("price")
    if raw_price is None:
        return None
    try:
        price = Decimal(str(raw_price))
    except (InvalidOperation, TypeError, ValueError):
        return None
    if not name:
        name = "Product"
    return name, price


class GetOrCreateCartView(APIView):
    def post(self, request):
        ser = GetOrCreateCartSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        customer_id = ser.validated_data["customer_id"]
        cart = _get_or_create_cart(customer_id)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartDetailView(APIView):
    def get(self, request):
        try:
            customer_id = int(request.query_params.get("customer_id", ""))
        except (TypeError, ValueError):
            return Response(
                {"detail": "customer_id is required and must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if customer_id < 1:
            return Response(
                {"detail": "customer_id must be positive."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cart = _cart_for_customer(customer_id)
        if cart is None:
            return Response(
                {"detail": "Cart not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(CartSerializer(cart).data)


class AddToCartView(APIView):
    def post(self, request):
        ser = AddToCartSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        customer_id = ser.validated_data["customer_id"]
        product_id = ser.validated_data["product_id"]
        product_type = ser.validated_data["product_type"]
        quantity = ser.validated_data["quantity"]

        snapshot = _product_snapshot(product_type, product_id)
        if snapshot is None:
            return Response(
                {"detail": "Product not found or invalid price."},
                status=status.HTTP_404_NOT_FOUND,
            )
        product_name, unit_price = snapshot

        cart = _get_or_create_cart(customer_id)
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_id=product_id,
            product_type=product_type,
            defaults={
                "product_name": product_name,
                "unit_price": unit_price,
                "quantity": quantity,
            },
        )
        if not created:
            item.product_name = product_name
            item.unit_price = unit_price
            item.quantity += quantity
            item.save(update_fields=["product_name", "unit_price", "quantity"])

        cart.refresh_from_db()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemDetailView(
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    """PATCH updates quantity; DELETE removes the line (same path)."""

    queryset = CartItem.objects.select_related("cart").prefetch_related("cart__items")
    serializer_class = UpdateCartItemSerializer
    lookup_field = "pk"

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class ClearCartView(APIView):
    def post(self, request):
        ser = ClearCartSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        customer_id = ser.validated_data["customer_id"]
        cart = _cart_for_customer(customer_id)
        if cart is None:
            return Response(
                {"detail": "Cart not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        cart.items.all().delete()
        cart.refresh_from_db()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class InternalGetCartView(APIView):
    permission_classes = [IsInternalAPI]

    def get(self, request, customer_id):
        cart = _cart_for_customer(customer_id)
        if cart is None:
            return Response(
                {"detail": "Cart not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(CartSerializer(cart).data)


# Single URL for PATCH and DELETE; aliases match spec names.
UpdateCartItemView = CartItemDetailView
RemoveCartItemView = CartItemDetailView
