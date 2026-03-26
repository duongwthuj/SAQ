from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import ProductFilter
from .models import Category, Product
from .serializers import CategorySerializer, ProductListSerializer, ProductSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (AllowAny,)


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related("category").filter(is_active=True)
    permission_classes = (AllowAny,)
    filterset_class = ProductFilter
    search_fields = ["name", "brand", "description"]
    ordering_fields = ["price", "created_at", "name"]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ProductListSerializer
        return ProductSerializer


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related("category")
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)


class InternalProductView(APIView):
    """Internal endpoint for other services to fetch product info."""
    permission_classes = (AllowAny,)

    def get(self, request, pk):
        token = request.headers.get("X-Internal-Token", "")
        if token != settings.INTERNAL_API_KEY:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        try:
            product = Product.objects.get(pk=pk, is_active=True)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(ProductSerializer(product).data)


class InternalProductBulkView(APIView):
    """Internal endpoint: fetch multiple products by IDs."""
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.headers.get("X-Internal-Token", "")
        if token != settings.INTERNAL_API_KEY:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        product_ids = request.data.get("product_ids", [])
        products = Product.objects.filter(pk__in=product_ids, is_active=True)
        data = {str(p.id): ProductSerializer(p).data for p in products}
        return Response(data)
