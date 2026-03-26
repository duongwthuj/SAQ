from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .clients import ServiceError
from .models import Order
from .serializers import (
    CreateOrderSerializer,
    OrderListSerializer,
    OrderSerializer,
    UpdateStatusSerializer,
)


class OrderListCreateView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        qs = Order.objects.all()
        user_id = self.request.query_params.get("user_id")
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            order = services.create_order(
                user_id=serializer.validated_data["user_id"],
                items=serializer.validated_data["items"],
                shipping_address=serializer.validated_data["shipping_address"],
            )
        except ServiceError as e:
            return Response({"detail": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.prefetch_related("items")
    serializer_class = OrderSerializer
    permission_classes = (AllowAny,)


class OrderUpdateStatusView(APIView):
    permission_classes = (AllowAny,)

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data)


class OrderCancelView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, pk):
        try:
            order = Order.objects.prefetch_related("items").get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            order = services.cancel_order(order)
        except ServiceError as e:
            return Response({"detail": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(OrderSerializer(order).data)
