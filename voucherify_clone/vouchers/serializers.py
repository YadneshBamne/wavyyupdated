# vouchers/serializers.py

from rest_framework import serializers
from .models import Voucher, Redemption

class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = ['id', 'code', 'discount_type', 'discount_value', 'expiration_date', 'created_at', 'updated_at']

class RedemptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Redemption
        fields = ['id', 'voucher', 'user', 'redeemed_at']
