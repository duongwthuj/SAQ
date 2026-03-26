from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .models import Inventory
from .serializers import (
    InventorySerializer,
    RestockSerializer,
    StockCheckSerializer,
    StockDeductSerializer,
)


def _check_internal_token(request):
    token = request.headers.get("X-Internal-Token", "")
    return token == settings.INTERNAL_API_KEY


class InventoryDetailView(generics.RetrieveAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = (AllowAny,)
    lookup_field = "product_id"


class InventoryCreateView(generics.CreateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = (AllowAny,)


class CheckStockView(APIView):
    """Check stock availability for multiple items."""
    permission_classes = (AllowAny,)

    def post(self, request):
        if not _check_internal_token(request):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        serializer = StockCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        all_ok, details = services.check_stock(serializer.validated_data["items"])
        return Response({"all_in_stock": all_ok, "details": details})


class DeductStockView(APIView):
    """Deduct stock when order is placed."""
    permission_classes = (AllowAny,)

    def post(self, request):
        if not _check_internal_token(request):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        serializer = StockDeductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            results = services.deduct_stock(serializer.validated_data["items"])
        except (ValueError, Inventory.DoesNotExist) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"deducted": results})


class RestockView(APIView):
    """Restock items (e.g. on order cancellation)."""
    permission_classes = (AllowAny,)

    def post(self, request):
        if not _check_internal_token(request):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        serializer = RestockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = services.restock(
            serializer.validated_data["product_id"],
            serializer.validated_data["quantity"],
        )
        return Response(result)
