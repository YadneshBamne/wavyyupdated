# views.py
from rest_framework import generics, status, request
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Business, OTP, ServiceCategory, Services, Client, TeamMember, Appointment, Packages
from .serializers import BusinessSerializer, OTPSerializer, ServiceCategorySerializer, ServicesSerializer, ClientSerializer, TeamMemberSerializer, AppointmentSerializer, PackagesSerializer
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from phonenumbers import parse, is_valid_number, format_number, PhoneNumberFormat
from twilio.rest import Client as cl
import os
from django.conf import settings

def send_otp_twilio(otp, number):
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    client = cl(account_sid, auth_token)
    
    message = client.messages.create(
        body = f"Your otp for wavvy login is {otp}",
        from_="+16206788254",
        to= f"{number}"
    )
    
    print(message.body)

class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a new OTP record
        otp = OTP(phone_number=phone_number)
        otp.generate_otp()
        otp.save()
        
        # Here you would send the OTP to the user's phone number
        # For now, we'll just print it to the console
        print(f"OTP for {phone_number} is {otp.otp}")
        
        
        return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def post(self, request):
        phone_number = request.data.get('phone_number')
        otp = request.data.get('otp')
        
        if not phone_number or not otp:
            return Response({'error': 'Phone number and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch the most recent OTP record for the given phone number
        otp_record = OTP.objects.filter(phone_number=phone_number).order_by('-created_at').first()
        
        if not otp_record:
            return Response({'error': 'No OTP found for this phone number'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Debugging: Print OTP creation time and current time
        print(f"OTP created at: {otp_record.created_at}")
        print(f"Current time: {timezone.now()}")
        
        # Check if the OTP matches
        if otp_record.otp != otp:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if the OTP is expired
        if otp_record.created_at < timezone.now() - timedelta(minutes=5):
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark the OTP as verified
        otp_record.is_verified = True
        otp_record.save()
        
        # Store the verified phone number in the session
        request.session['verified_phone_number'] = phone_number
        request.session.save()
        
        return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)
    
class CheckBusinessView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            business = Business.objects.get(phone_number=phone_number)
            return Response({'exists': True, 'redirect': '/dashboard', 'business_id': business.id}, status=status.HTTP_200_OK)
        except Business.DoesNotExist:
            return Response({'exists': False, 'redirect': '/register'}, status=status.HTTP_200_OK)

# CRUD Views for Business
class BusinessListCreateView(generics.ListCreateAPIView):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access

class BusinessDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    lookup_field = 'id'
    permission_classes = [AllowAny]  # Allow unauthenticated access

# CRUD Views for other models (ServiceCategory, Services, Client, TeamMember, Appointment)
class ServiceCategoryListCreateView(generics.ListCreateAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def get_queryset(self):
        business_id = self.request.query_params.get('business_id')
        if business_id:
            return ServiceCategory.objects.filter(business_id=business_id)
        return ServiceCategory.objects.all()

class ServiceCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access

class ServicesListCreateView(generics.ListCreateAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def get_queryset(self):
        business_id = self.request.query_params.get('business_id')
        category_id = self.request.query_params.get('category_id')  # Filter by category
        
        queryset = Services.objects.all()
        if business_id:
            queryset = queryset.filter(business_id=business_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)  # Filter services by category
        return queryset

class ServicesDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
class PackagesListCreateView(generics.ListCreateAPIView):
    queryset = Packages.objects.all()
    serializer_class = PackagesSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def get_queryset(self):
        business_id = self.request.query_params.get('business_id')
        if business_id:
            return Packages.objects.filter(business_id=business_id)
        return Packages.objects.all()

class PackagesDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Packages.objects.all()
    serializer_class = PackagesSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access

class ClientListCreateView(generics.ListCreateAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def get_queryset(self):
        business_id = self.request.query_params.get('business_id')
        if business_id:
            return Client.objects.filter(business_id=business_id)
        return Client.objects.all()

class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access

def client_metadata_view(request):
    metadata = {}
    for field in Client._meta.get_fields():
        if hasattr(field, 'choices') and field.choices:
            metadata[field.name] = {
                "type": type(field).__name__,
                "choices": list(field.choices),
            }
        else:
            metadata[field.name] = {
                "type": type(field).__name__,
                "nullable": field.null if hasattr(field, 'null') else False,
            }

    return JsonResponse(metadata)


class TeamMemberListCreateView(generics.ListCreateAPIView):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def get_queryset(self):
        # Filter team members based on the business_id provided in the query parameters
        business_id = self.request.query_params.get('business_id')
        if business_id:
            return TeamMember.objects.filter(business_id=business_id)
        return TeamMember.objects.all()

class TeamMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access

class AppointmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        business_id = self.request.query_params.get('business_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        queryset = Appointment.objects.all()
        if business_id:
            queryset = queryset.filter(business_id=business_id)
        if start_date and end_date:
            queryset = queryset.filter(
                appointment_date__range=[start_date, end_date]
            )
        return queryset


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    
    
    
    
# APP APIS FOR CUSTOMER

from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse , request
from rest_framework import generics, status
from .models import Customer, Business, Services, Appointment
from .serializers import CustomerSerializer, ServicesSerializer, BusinessSerializer, AppointmentSerializer
from rest_framework.decorators import api_view, APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_200_OK, HTTP_204_NO_CONTENT
from .serializers import CustomerSerializer
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.core.cache import cache
from django.contrib.auth import authenticate
from django.db.models import Q
import time
import random 
from twilio.rest import Client
import os 
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import RetrieveAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
import math
class CustomerView(generics.CreateAPIView) :
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class CustomerListView(generics.ListAPIView) : 
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


# PROFILE VIEW
class CustomerProfileView(RetrieveAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            # Fetch the profile for the authenticated user
            return self.request.user.customer_profile
        except Customer.DoesNotExist:
            # If no profile exists for the user, raise a custom 404 error
            raise NotFound(detail="Profile Not Found")
# PROFILE UPDATE 

class CustomerProfileUpdateView(UpdateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get_object(self):
        try:
            return self.request.user.customer_profile
        except Customer.DoesNotExist:
            raise NotFound(detail="Profile Not Found")
# PROFILE UPDATE 

from rest_framework.generics import DestroyAPIView

# PROFILE DELETE


class CustomerProfileDeleteView(DestroyAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get_object(self):
        try:
            return self.request.user.customer_profile
        except Customer.DoesNotExist:
            raise NotFound(detail="Profile Not Found")
def generate_otp() : 
    return random.randint(1000, 9999)

def send_otp(otp, phone_number) : 
    account_sid = os.environ["TWILIO_ACCOUNT_SID"]
    auth_token = os.environ["TWILIO_AUTH_TOKEN"]
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body="Your Login OTP for wavvy application is {otp}. Welcome aboard!",
        from_="+16206788254 ",
        to=f"{phone_number}",
    )

    # print(message.body)
    print(f"{otp} sent to number {phone_number}")

def user_exists(phone_number = None, email = None):
    return Customer.objects.filter(phone_number=phone_number).exists() or Customer.objects.filter(email=email).exists()

#TO CALCUATE DISTANCE 
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c  
    return distance




@api_view(['POST']) 
def login(request):
    if request.data["method"] == "phone" :
        phone_number = request.data["phone_number"]
        if not phone_number : 
            return Response({"error" : "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        #GENERATE 4 DIGIT OTP CODE 
        otp = generate_otp()
        print(otp)
        cache.set(f"otp_{phone_number}", otp, timeout=300)
        #send OTP through twilio 
        send_otp(otp, phone_number)
        return Response({"message" : "otp sent to number ", }, status=status.HTTP_200_OK)

    elif request.data["method"] == "email":
        email = request.data.get("email")
        password = request.data.get("password")

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        if user_exists(email=email):
            # Custom authentication using email
            user = authenticate(request, username=email, password=password)
            if user is not None:
                token, created = Token.objects.get_or_create(user=user)
                return Response({"message": "Login successful", "token": token.key}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        else:
            return Response({"message": "New User, Sign up"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"error": "Invalid method"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def verify_otp(request):
    phone_number = request.data.get("phone_number")
    otp = request.data.get("otp")
    if not phone_number or not otp:
        return Response({"error": "Phone number and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)
    cached_otp = cache.get(f"otp_{phone_number}")
    if cached_otp and str(cached_otp) == str(otp):
        if user_exists(phone_number=phone_number) :
            return Response({"message": "Verification successful"}, status=status.HTTP_202_ACCEPTED)
        else : 
            return Response({"message" : "New User, proceed to signup"})
    else:
        return Response({"message": "Incorrect or expired OTP"}, status=status.HTTP_406_NOT_ACCEPTABLE)


@api_view(['POST'])
def signup(request) :
    if request.data["method"] == "phone" :
        phone_number = request.data["phone_number"]
        if not phone_number :
            return Response({"error" : "phone_number is required "}, status=status.HTTP_400_BAD_REQUEST)
        if user_exists(phone_number=phone_number) :
            user = User.objects.filter(customer_profile__phone_number=phone_number).first()
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {"message": "User already exists, logged in", "token": token.key},
                status=status.HTTP_200_OK
            )
        otp = generate_otp()
        print(otp)
        cache.set(f"otp_{phone_number}", otp, timeout=300)
        #send OTP through twilio 
        send_otp(otp, phone_number)
        return Response({"message" : "otp sent to number ", }, status=status.HTTP_200_OK)  
    elif request.data["method"] == "email" : 
        email = request.data["email"]
        password = request.data["password"]
        if not email :
            return Response({"error" : "email is required "}, status=status.HTTP_400_BAD_REQUEST)   
        if not password : 
            return Response({"error" : "password is required "}, status=status.HTTP_400_BAD_REQUEST)   
        if user_exists(email=email) :
            user = User.objects.filter(customer_profile__email__iexact=email).first()
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {"message": "User already exists, logged in", "token": token.key},
                status=status.HTTP_200_OK
            )
        return Response({"email" : email, "password" : password, "message" : "new user proceed to signup"}, status=status.HTTP_200_OK)


@api_view(['POST']) 
def signup_create_user(request):
    serializer = CustomerSerializer(data = request.data)
    if serializer.is_valid() :
        user = User.objects.create_user(
            username= request.data["name"] + str(random.randint(0, 9999)),
            email=request.data["email"],
            password=request.data.get('password', '')
        )
        customer = serializer.save(user=user)
        token = Token.objects.create(user=user)
        return Response({"token" : token.key, "customer" : serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def test_token(request):
    return Response({"passed for {}".format(request.user)})



### -----LOCATION API-------
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_Business_by_location(request):
    latitude = float(request.query_params.get('latitude'))
    longitude = float(request.query_params.get('longitude'))
    
    Business = Business.objects.all()
    nearby_Business = []

    for Business in Business:
        distance = haversine(latitude, longitude, Business.latitude, Business.longitude)
        if distance <= 10:  
            nearby_Business.append({
                'name': Business.name,
                'address': Business.address,
                'distance': distance
            })

    return Response(nearby_Business)

###----SERVICES----

class ServiceFilterView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        category = request.query_params.get('category')
        price_min = request.query_params.get('priceMin')
        price_max = request.query_params.get('priceMax')
        rating = request.query_params.get('rating')

        filters = Q()

        if category:
            filters &= Q(category__name__icontains=category)
        if price_min:
            filters &= Q(price__gte=price_min)
        if price_max:
            filters &= Q(price__lte=price_max)
        if rating:
            filters &= Q(rating__gte=rating)

        services = Services.objects.filter(filters)
        serializer = ServicesSerializer(services, many=True)
        return Response(serializer.data)
    

###Business DETAILS API 

class BusinessDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, Business_id):
        Business = get_object_or_404(Business, id=Business_id)
        serializer = BusinessSerializer(Business)
        return Response(serializer.data)

# View for fetching services for a Business
class BusinessServicesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, Business_id):
        Business = get_object_or_404(Business, id=Business_id)
        services = Business.business_services.all() 
        serializer = ServicesSerializer(services, many=True)
        return Response(serializer.data)



## Appointment HANDLING 


# POST /Appointments/create
class AppointmentCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        Business_id = request.data.get('Business_id')
        service_id = request.data.get('service_id')
        appointment_date = request.data.get('appointment_date')

        # Validate input
        if not Business_id or not service_id or not appointment_date:
            return Response({"error": "Business_id, service_id, and appointment_date are required."}, status=HTTP_400_BAD_REQUEST)

        Business = get_object_or_404(Business, id=Business_id)
        service = get_object_or_404(Services, id=service_id)

        # Create Appointment
        Appointment = Appointment.objects.create(
            user=user,
            Business=Business,
            service=service,
            appointment_date=appointment_date,
            total_price=service.price
        )
        serializer = AppointmentSerializer(Appointment)
        return Response(serializer.data, status=HTTP_201_CREATED)

# DELETE /Appointments/{AppointmentId}/cancel
class AppointmentCancelView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, Appointment_id):
        Appointment = get_object_or_404(Appointment, id=Appointment_id, user=request.user)

        if Appointment.status == "completed":
            return Response({"error": "Cannot cancel a completed Appointment."}, status=HTTP_400_BAD_REQUEST)

        Appointment.status = "canceled"
        Appointment.save()
        return Response({"message": "Appointment canceled successfully."}, status=HTTP_200_OK)

# GET /Appointments/status?userId={userId}
class AppointmentStatusView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('userId')
        if not user_id or int(user_id) != request.user.id:
            return Response({"error": "Invalid or unauthorized userId."}, status=HTTP_400_BAD_REQUEST)

        Appointments = Appointment.objects.filter(user=request.user)
        serializer = AppointmentSerializer(Appointments, many=True)
        return Response(serializer.data, status=HTTP_200_OK)