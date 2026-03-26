from django.contrib.auth.models import AbstractUser
from django.db import models


class Staff(AbstractUser):
    position = models.CharField(max_length=100, blank=True, default="")
    department = models.CharField(max_length=100, blank=True, default="")

    class Meta:
        db_table = "staff"

    def __str__(self):
        return f"{self.username} ({self.department})"
