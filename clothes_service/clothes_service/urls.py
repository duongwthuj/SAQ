from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/clothes/", include("clothes_service.clothes.urls")),
]
