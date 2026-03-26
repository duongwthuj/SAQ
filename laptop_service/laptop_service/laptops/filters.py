from django_filters import rest_framework as filters

from .models import Laptop


class LaptopFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    brand = filters.CharFilter(field_name="brand", lookup_expr="iexact")
    category = filters.NumberFilter(field_name="category_id")

    class Meta:
        model = Laptop
        fields = ["brand", "category", "is_active"]
