import requests
from django.conf import settings

TIMEOUT = 10


def _headers():
    return {"X-Internal-Token": settings.INTERNAL_API_KEY}


class LaptopClient:
    @staticmethod
    def get_laptop(product_id):
        url = f"{settings.LAPTOP_SERVICE_URL}/api/laptops/internal/laptops/{product_id}/"
        resp = requests.get(url, headers=_headers(), timeout=TIMEOUT)
        if resp.status_code != 200:
            return None
        return resp.json()


class ClothesClient:
    @staticmethod
    def get_item(product_id):
        url = f"{settings.CLOTHES_SERVICE_URL}/api/clothes/internal/clothes/{product_id}/"
        resp = requests.get(url, headers=_headers(), timeout=TIMEOUT)
        if resp.status_code != 200:
            return None
        return resp.json()
