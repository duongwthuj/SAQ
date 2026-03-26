from django.contrib.auth.models import AbstractUser
from django.db import models


class Customer(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, default="")
    address = models.TextField(blank=True, default="")

    class Meta:
        db_table = "customers"

    def __str__(self):
        return self.username
