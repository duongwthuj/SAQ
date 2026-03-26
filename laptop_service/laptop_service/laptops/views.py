from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.generics import (
    CreateAPIView,
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import LaptopFilter
from .models import Category, Inventory, Laptop
from .serializers import (
    CategorySerializer,
    InventorySerializer,
    LaptopListSerializer,
    LaptopSerializer,
    RestockSerializer,
    StockCheckSerializer,
    StockDeductSerializer,
)
from . import services


def _internal_token_ok(request):
    token = request.headers.get("X-Internal-Token") or request.META.get(
        "HTTP_X_INTERNAL_TOKEN", ""
    )
    expected = settings.INTERNAL_API_KEY
    return bool(expected) and token == expected


class InternalTokenMixin:
    def dispatch(self, request, *args, **kwargs):
        if not _internal_token_ok(request):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        return super().dispatch(request, *args, **kwargs)


class CategoryListCreateView(ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class LaptopListCreateView(ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Laptop.objects.select_related("category").all()
    filterset_class = LaptopFilter
    search_fields = ["name", "brand", "description"]
    ordering_fields = ["price", "created_at", "name"]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return LaptopListSerializer
        return LaptopSerializer


class LaptopDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Laptop.objects.select_related("category").all()
    serializer_class = LaptopSerializer


class InventoryCreateView(CreateAPIView):
    permission_classes = [AllowAny]
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer


class InventoryDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Inventory.objects.select_related("laptop").all()
    serializer_class = InventorySerializer
    lookup_field = "laptop_id"


class InternalLaptopView(InternalTokenMixin, RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Laptop.objects.select_related("category").all()
    serializer_class = LaptopSerializer


class InternalLaptopBulkView(InternalTokenMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        product_ids = request.data.get("product_ids")
        if not isinstance(product_ids, list):
            return Response(
                {"detail": "product_ids must be a list"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        laptops = Laptop.objects.select_related("category").filter(pk__in=product_ids)
        data = {str(l.pk): LaptopSerializer(l).data for l in laptops}
        return Response(data)


class CheckStockView(InternalTokenMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = StockCheckSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        items = [
            {"product_id": i["product_id"], "quantity": i["quantity"]}
            for i in ser.validated_data["items"]
        ]
        all_ok, details = services.check_stock(items)
        return Response({"all_ok": all_ok, "details": details})


class DeductStockView(InternalTokenMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = StockDeductSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        items = [
            {"product_id": i["product_id"], "quantity": i["quantity"]}
            for i in ser.validated_data["items"]
        ]
        try:
            results = services.deduct_stock(items)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Inventory.DoesNotExist:
            return Response(
                {"detail": "Inventory not found for one or more products"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"results": results})


class RestockView(InternalTokenMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RestockSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        pid = ser.validated_data["product_id"]
        qty = ser.validated_data["quantity"]
        try:
            payload = services.restock(pid, qty)
        except Inventory.DoesNotExist:
            return Response(
                {"detail": f"No inventory for laptop_id={pid}"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(payload)

