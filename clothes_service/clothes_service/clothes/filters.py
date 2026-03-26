import django_filters

from .models import ClothingItem


class ClothingItemFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    brand = django_filters.CharFilter(field_name="brand", lookup_expr="iexact")
    category = django_filters.NumberFilter(field_name="category_id")
    size = django_filters.CharFilter(field_name="size", lookup_expr="iexact")
    color = django_filters.CharFilter(field_name="color", lookup_expr="iexact")

    class Meta:
        model = ClothingItem
        fields = ("min_price", "max_price", "brand", "category", "size", "color")
