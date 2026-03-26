import requests
from django.conf import settings

TIMEOUT = 10


class ServiceError(Exception):
    def __init__(self, service, status_code, detail):
        self.service = service
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"{service} error ({status_code}): {detail}")


def _headers():
    return {"X-Internal-Token": settings.INTERNAL_API_KEY}


class UserClient:
    @staticmethod
    def validate_user(user_id):
        url = f"{settings.USER_SERVICE_URL}/api/users/internal/validate/{user_id}/"
        resp = requests.get(url, headers=_headers(), timeout=TIMEOUT)
        if resp.status_code != 200:
            raise ServiceError("UserService", resp.status_code, resp.text)
        return resp.json()


class ProductClient:
    @staticmethod
    def get_products(product_ids):
        url = f"{settings.PRODUCT_SERVICE_URL}/api/internal/products/bulk/"
        resp = requests.post(url, json={"product_ids": product_ids}, headers=_headers(), timeout=TIMEOUT)
        if resp.status_code != 200:
            raise ServiceError("ProductService", resp.status_code, resp.text)
        return resp.json()


class InventoryClient:
    @staticmethod
    def check_stock(items):
        url = f"{settings.INVENTORY_SERVICE_URL}/api/internal/inventory/check-stock/"
        resp = requests.post(url, json={"items": items}, headers=_headers(), timeout=TIMEOUT)
        if resp.status_code != 200:
            raise ServiceError("InventoryService", resp.status_code, resp.text)
        return resp.json()

    @staticmethod
    def deduct(items):
        url = f"{settings.INVENTORY_SERVICE_URL}/api/internal/inventory/deduct/"
        resp = requests.post(url, json={"items": items}, headers=_headers(), timeout=TIMEOUT)
        if resp.status_code != 200:
            raise ServiceError("InventoryService", resp.status_code, resp.text)
        return resp.json()

    @staticmethod
    def restock(product_id, quantity):
        url = f"{settings.INVENTORY_SERVICE_URL}/api/internal/inventory/restock/"
        resp = requests.post(
            url, json={"product_id": product_id, "quantity": quantity},
            headers=_headers(), timeout=TIMEOUT,
        )
        if resp.status_code != 200:
            raise ServiceError("InventoryService", resp.status_code, resp.text)
        return resp.json()
