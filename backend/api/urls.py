# urls.py
from django.urls import path
from .views import (
    ServicesListCreateView,
    ServicesDetailView,
    ServiceCategoryListCreateView,
    ServiceCategoryDetailView,
    BusinessListCreateView,
    BusinessDetailView,
    ClientListCreateView,
    ClientDetailView,
    TeamMemberListCreateView,
    TeamMemberDetailView,
    AppointmentListCreateView,
    AppointmentDetailView,
    SendOTPView,
    CheckBusinessView,
    VerifyOTPView,
    PackagesListCreateView,
    PackagesDetailView,
    client_metadata_view
)
from django.urls import path
from .views import CustomerView, CustomerListView, signup_create_user, login, test_token, verify_otp, signup
from .views import CustomerProfileView, CustomerProfileUpdateView, CustomerProfileDeleteView, get_Business_by_location, ServiceFilterView
from .views import BusinessDetailView, BusinessServicesView, AppointmentCreateView, AppointmentStatusView, AppointmentCancelView

urlpatterns = [
    # Services
    path('services/', ServicesListCreateView.as_view(), name='services-list-create'),
    path('services/<int:pk>/', ServicesDetailView.as_view(), name='services-detail'),

    # Service Categories
    path('service-categories/', ServiceCategoryListCreateView.as_view(), name='service-category-list-create'),
    path('service-categories/<int:pk>/', ServiceCategoryDetailView.as_view(), name='service-category-detail'),

    # Business
    path('business/', BusinessListCreateView.as_view(), name='business-list-create'),
    path('business/<int:id>/', BusinessDetailView.as_view(), name='business-detail'),

    # Clients
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
    path('client-metadata/', client_metadata_view, name='client-metadata'),

    # Team Members
    path('team-members/', TeamMemberListCreateView.as_view(), name='team-member-list-create'),
    path('team-members/<int:pk>/', TeamMemberDetailView.as_view(), name='team-member-detail'),

    # Appointments
    path('appointments/', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    
    # Packages
    path('packages/', PackagesListCreateView.as_view(), name='packages-list-create'),
    path('packages/<int:pk>/', PackagesDetailView.as_view(), name='packages-detail'),

    # Authentication / OTP Routes
    path('check-business/', CheckBusinessView.as_view(), name='check-business'),
    path('send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    
    # APP URLS
    
    path('post', CustomerView.as_view()),
    path('get', CustomerListView.as_view()),
    path('auth/signup', signup),
    path('auth/signup_create_user', signup_create_user),
    path('auth/login', login),
    path('auth/verify-otp', verify_otp ),
    path('auth/test_token', test_token),
    path('profile/view', CustomerProfileView.as_view(), name='view-profile'),
    path('profile/update', CustomerProfileUpdateView.as_view(), name='update-profile'),
    path('profile/delete', CustomerProfileDeleteView.as_view(), name='delete-profile'),
    path('salons/', get_Business_by_location, name='get_salons_by_location'),
    path('services/filter', ServiceFilterView.as_view(), name='service_filter'),
    path('salons/<int:salon_id>', BusinessDetailView.as_view(), name='salon_detail'),
    path('salons/<int:salon_id>/services', BusinessServicesView.as_view(), name='salon_services'),
    path('bookings/create', AppointmentCreateView.as_view(), name='create_booking'),
    path('bookings/<int:booking_id>/cancel', AppointmentCancelView.as_view(), name='cancel_booking'),
    path('bookings/status', AppointmentStatusView.as_view(), name='booking_status'),
]
