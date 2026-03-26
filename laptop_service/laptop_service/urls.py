from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/laptops/", include("laptop_service.laptops.urls")),
]
