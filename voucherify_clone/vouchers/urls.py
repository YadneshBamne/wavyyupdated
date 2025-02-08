# vouchers/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VoucherViewSet, RedemptionViewSet

router = DefaultRouter()
router.register(r'vouchers', VoucherViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('redeem/<str:voucher_code>/', RedemptionViewSet.as_view({'post': 'create'})),
]
