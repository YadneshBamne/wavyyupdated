# vouchers/models.py

from django.db import models
from django.contrib.auth.models import User

class Voucher(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=[('fixed', 'Fixed'), ('percent', 'Percent')])
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    expiration_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.code

class Redemption(models.Model):
    voucher = models.ForeignKey(Voucher, related_name='redemptions', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    redeemed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.voucher.code}"
