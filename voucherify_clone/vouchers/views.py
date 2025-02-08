# vouchers/views.py

from rest_framework import status, viewsets
from django.utils import timezone
from rest_framework.response import Response
from .models import Voucher, Redemption
from .serializers import VoucherSerializer, RedemptionSerializer

class VoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    
    def perform_create(self, serializer):
        # You can add any custom logic for voucher creation here
        serializer.save()

class RedemptionViewSet(viewsets.ViewSet):
    def create(self, request, voucher_code=None):
        voucher = Voucher.objects.filter(code=voucher_code).first()
        if not voucher or voucher.expiration_date < timezone.now().date():
            return Response({"error": "Invalid or expired voucher"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create redemption record
        redemption = Redemption.objects.create(voucher=voucher, user=request.user)
        
        # Apply discount logic here based on voucher type
        if voucher.discount_type == 'percent':
            discount_value = voucher.discount_value
        elif voucher.discount_type == 'fixed':
            discount_value = voucher.discount_value
        
        return Response({"message": "Voucher redeemed", "discount": discount_value}, status=status.HTTP_201_CREATED)
