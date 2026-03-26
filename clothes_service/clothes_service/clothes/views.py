from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import ClothingItemFilter
from .models import Category, ClothingItem, Inventory
from . import services
from .serializers import (
    CategorySerializer,
    ClothingItemListSerializer,
    ClothingItemSerializer,
    InternalBulkIdsSerializer,
    InventorySerializer,
    RestockSerializer,
    StockCheckSerializer,
    StockDeductSerializer,
)


def _internal_token_ok(request):
    return request.headers.get("X-Internal-Token", "") == settings.INTERNAL_API_KEY


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (AllowAny,)


class ClothingItemListCreateView(generics.ListCreateAPIView):
    queryset = ClothingItem.objects.select_related("category").all()
    filterset_class = ClothingItemFilter
    permission_classes = (AllowAny,)
    search_fields = ("name", "brand", "slug")
    ordering_fields = ("price", "created_at", "name", "brand")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ClothingItemSerializer
        return ClothingItemListSerializer


class ClothingItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ClothingItem.objects.select_related("category").all()
    serializer_class = ClothingItemSerializer
    permission_classes = (AllowAny,)


class InventoryCreateView(generics.CreateAPIView):
    queryset = Inventory.objects.select_related("item").all()
    serializer_class = InventorySerializer
    permission_classes = (AllowAny,)


class InventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.select_related("item").all()
    serializer_class = InventorySerializer
    permission_classes = (AllowAny,)
    lookup_field = "item_id"
    lookup_url_kwarg = "item_id"


class InternalClothingItemView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, pk):
        if not _internal_token_ok(request):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        item = get_object_or_404(ClothingItem.objects.select_related("category"), pk=pk)
        return Response(ClothingItemSerializer(item).data)


class InternalClothingItemBulkView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if not _internal_token_ok(request):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        ser = InternalBulkIdsSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ids = ser.validated_data["ids"]
        items = ClothingItem.objects.select_related("category").filter(pk__in=ids)
        return Response({"items": ClothingItemSerializer(items, many=True).data})


class CheckStockView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if not _internal_token_ok(request):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        ser = StockCheckSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        result = services.check_stock(ser.validated_data["items"])
        return Response(result)


class DeductStockView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if not _internal_token_ok(request):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        ser = StockDeductSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            services.deduct_stock(ser.validated_data["items"])
        except Inventory.DoesNotExist:
            return Response({"detail": "Inventory not found for one or more products."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Stock deducted."}, status=status.HTTP_200_OK)


class RestockView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if not _internal_token_ok(request):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        ser = RestockSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            services.restock(
                ser.validated_data["product_id"],
                ser.validated_data["quantity"],
            )
        except Inventory.DoesNotExist:
            return Response({"detail": "Inventory not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"detail": "Stock updated."}, status=status.HTTP_200_OK)
