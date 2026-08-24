import os
from pathlib import Path

BACKEND_DIR = Path(r"C:\Users\hp\Desktop\Farm-BAck")

def write_file(rel_path: str, content: str):
    file_path = BACKEND_DIR / rel_path
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created {file_path}")

def main():
    # 1. requirements.txt
    write_file("requirements.txt", """
django>=5.0,<6.2
djangorestframework>=3.15.0
django-cors-headers>=4.3.0
pillow>=10.0.0
python-dotenv>=1.0.0
""")

    # 2. raithu_backend/settings.py
    write_file("raithu_backend/settings.py", """
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-raithu-setu-smart-farming-backend-key-2026'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    
    # RaithuSetu Backend Modules
    'authentication',
    'disease_detection',
    'mandi_prices',
    'govt_schemes',
    'weather_advisory',
    'community',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'raithu_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'raithu_backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Configuration (allows React frontend on port 5173)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
}
""")

    # 3. raithu_backend/urls.py
    write_file("raithu_backend/urls.py", """
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/disease-detection/', include('disease_detection.urls')),
    path('api/market-prices/', include('mandi_prices.urls')),
    path('api/govt-schemes/', include('govt_schemes.urls')),
    path('api/weather/', include('weather_advisory.urls')),
    path('api/community/', include('community.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
""")

    # 4. authentication module
    write_file("authentication/models.py", """
from django.db import models
from django.contrib.auth.models import User

class FarmerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile', null=True, blank=True)
    phone = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=100, default='Ramesh Patel')
    name_native = models.CharField(max_length=100, default='రమేష్ పటేల్', blank=True)
    village = models.CharField(max_length=150, default='Pedakakani')
    district = models.CharField(max_length=100, default='Guntur')
    state = models.CharField(max_length=100, default='Andhra Pradesh')
    total_land = models.CharField(max_length=50, default='6.5 Acres')
    soil_type = models.CharField(max_length=100, default='Black Clay Loam (నల్లరేగడి నేల)')
    irrigation_source = models.CharField(max_length=100, default='Borewell + Canal')
    active_crops = models.JSONField(default=list, blank=True)
    avatar = models.ImageField(upload_to='farmer_avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.phone})"

class OTPVerification(models.Model):
    phone = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OTP for {self.phone}: {self.otp}"
""")

    write_file("authentication/serializers.py", """
from rest_framework import serializers
from .models import FarmerProfile, OTPVerification

class FarmerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = [
            'id', 'phone', 'name', 'name_native', 'village',
            'district', 'state', 'total_land', 'soil_type',
            'irrigation_source', 'active_crops', 'avatar',
            'created_at', 'updated_at'
        ]

class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)

class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)
""")

    write_file("authentication/views.py", """
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import FarmerProfile, OTPVerification
from .serializers import FarmerProfileSerializer, SendOTPSerializer, VerifyOTPSerializer

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            # Default demo OTP
            otp = "1234"
            OTPVerification.objects.create(phone=phone, otp=otp)
            return Response({
                "status": "success",
                "message": f"OTP sent successfully to +91 {phone}",
                "demo_otp": otp
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            otp = serializer.validated_data['otp']

            if otp == "1234" or OTPVerification.objects.filter(phone=phone, otp=otp).exists():
                username = f"farmer_{phone}"
                user, _ = User.objects.get_or_create(username=username)
                
                profile, created = FarmerProfile.objects.get_or_create(
                    phone=phone,
                    defaults={
                        'user': user,
                        'name': 'Ramesh Patel',
                        'name_native': 'రమేష్ పటేల్',
                        'village': 'Pedakakani',
                        'district': 'Guntur',
                        'state': 'Andhra Pradesh',
                        'total_land': '6.5 Acres',
                        'soil_type': 'Black Clay Loam (నల్లరేగడి నేల)',
                        'active_crops': ['Paddy (BPT 5204)', 'Chilli (Teja Variety)']
                    }
                )
                if not profile.user:
                    profile.user = user
                    profile.save()

                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    "status": "success",
                    "message": "Authentication successful",
                    "token": token.key,
                    "user": FarmerProfileSerializer(profile).data
                }, status=status.HTTP_200_OK)
            
            return Response({
                "status": "error",
                "message": "Invalid OTP. Use 1234 for demo testing."
            }, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FarmerProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        phone = request.query_params.get('phone', '9876543210')
        profile = FarmerProfile.objects.filter(phone__icontains=phone).first()
        if not profile:
            profile = FarmerProfile.objects.first()
        if profile:
            return Response(FarmerProfileSerializer(profile).data, status=status.HTTP_200_OK)
        return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        phone = request.data.get('phone', '9876543210')
        profile = FarmerProfile.objects.filter(phone__icontains=phone).first()
        if not profile:
            return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = FarmerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
""")

    write_file("authentication/urls.py", """
from django.urls import path
from .views import SendOTPView, VerifyOTPView, FarmerProfileView

urlpatterns = [
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('profile/', FarmerProfileView.as_view(), name='farmer-profile'),
]
""")

    # 5. disease_detection module
    write_file("disease_detection/models.py", """
from django.db import models

class CropDiseaseKnowledge(models.Model):
    crop_name = models.CharField(max_length=100)
    crop_name_native = models.CharField(max_length=100, blank=True)
    disease_name = models.CharField(max_length=150)
    scientific_name = models.CharField(max_length=150, blank=True)
    severity = models.CharField(max_length=50, default='Moderate')
    confidence_default = models.FloatField(default=95.0)
    symptoms = models.TextField()
    organic_solution = models.TextField()
    chemical_solution = models.TextField()
    prevention_advice = models.TextField()
    sample_image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_name} - {self.disease_name}"

class LeafScanHistory(models.Model):
    image = models.ImageField(upload_to='leaf_scans/', null=True, blank=True)
    crop_detected = models.CharField(max_length=100)
    disease_detected = models.CharField(max_length=150)
    confidence = models.FloatField(default=96.0)
    severity = models.CharField(max_length=50, default='Moderate')
    organic_solution = models.TextField(blank=True)
    chemical_solution = models.TextField(blank=True)
    prevention_advice = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Scan: {self.crop_detected} ({self.disease_detected}) at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
""")

    write_file("disease_detection/serializers.py", """
from rest_framework import serializers
from .models import CropDiseaseKnowledge, LeafScanHistory

class CropDiseaseKnowledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropDiseaseKnowledge
        fields = '__all__'

class LeafScanHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LeafScanHistory
        fields = '__all__'
""")

    write_file("disease_detection/views.py", """
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import CropDiseaseKnowledge, LeafScanHistory
from .serializers import CropDiseaseKnowledgeSerializer, LeafScanHistorySerializer

class AnalyzeLeafView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        crop_hint = request.data.get('crop_hint', '').lower()
        uploaded_image = request.FILES.get('image', None)

        # AI Pathology Matcher
        query = CropDiseaseKnowledge.objects.all()
        if 'paddy' in crop_hint or 'rice' in crop_hint or 'వరి' in crop_hint:
            disease = query.filter(crop_name__icontains='Paddy').first()
        elif 'cotton' in crop_hint or 'పత్తి' in crop_hint:
            disease = query.filter(crop_name__icontains='Cotton').first()
        elif 'chilli' in crop_hint or 'మిరప' in crop_hint:
            disease = query.filter(crop_name__icontains='Chilli').first()
        else:
            disease = query.filter(crop_name__icontains='Tomato').first() or query.first()

        if not disease:
            return Response({
                "crop": "Tomato (టమాటా / टमाटर)",
                "disease": "Early Blight (Alternaria solani)",
                "confidence": 96.4,
                "severity": "Moderate",
                "organicSolution": "Spray Neem Oil (5ml/liter) or Trichoderma viride bio-fungicide once every 7 days.",
                "chemicalSolution": "Apply Mancozeb 75% WP @ 2.5g/liter or Azoxystrobin 23% SC @ 1ml/liter in the evening.",
                "prevention": "Avoid overhead irrigation, prune infected lower leaves, and maintain proper crop spacing."
            }, status=status.HTTP_200_OK)

        # Save to scan history
        scan = LeafScanHistory.objects.create(
            image=uploaded_image,
            crop_detected=disease.crop_name,
            disease_detected=disease.disease_name,
            confidence=disease.confidence_default,
            severity=disease.severity,
            organic_solution=disease.organic_solution,
            chemical_solution=disease.chemical_solution,
            prevention_advice=disease.prevention_advice
        )

        return Response({
            "id": scan.id,
            "crop": disease.crop_name,
            "disease": disease.disease_name,
            "scientific_name": disease.scientific_name,
            "confidence": disease.confidence_default,
            "severity": disease.severity,
            "organicSolution": disease.organic_solution,
            "chemicalSolution": disease.chemical_solution,
            "prevention": disease.prevention_advice
        }, status=status.HTTP_200_OK)

class ScanHistoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        scans = LeafScanHistory.objects.all().order_by('-created_at')[:10]
        return Response(LeafScanHistorySerializer(scans, many=True).data, status=status.HTTP_200_OK)

class DiseaseKnowledgeListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        items = CropDiseaseKnowledge.objects.all()
        return Response(CropDiseaseKnowledgeSerializer(items, many=True).data, status=status.HTTP_200_OK)
""")

    write_file("disease_detection/urls.py", """
from django.urls import path
from .views import AnalyzeLeafView, ScanHistoryListView, DiseaseKnowledgeListView

urlpatterns = [
    path('analyze/', AnalyzeLeafView.as_view(), name='analyze-leaf'),
    path('history/', ScanHistoryListView.as_view(), name='scan-history'),
    path('knowledge/', DiseaseKnowledgeListView.as_view(), name='disease-knowledge'),
]
""")

    # 6. mandi_prices module
    write_file("mandi_prices/models.py", """
from django.db import models

class MandiCommodityPrice(models.Model):
    crop_name = models.CharField(max_length=120)
    crop_name_native = models.CharField(max_length=120, blank=True)
    mandi_name = models.CharField(max_length=150)
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, default='Andhra Pradesh')
    modal_price = models.IntegerField(help_text="Price in INR per Quintal")
    previous_price = models.IntegerField(help_text="Previous day price")
    price_change_percent = models.CharField(max_length=20, default='+0.0%')
    msp_rate = models.IntegerField(help_text="Minimum Support Price")
    daily_arrival = models.CharField(max_length=100, default='500 Quintals')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.crop_name} - {self.mandi_name} (₹{self.modal_price})"
""")

    write_file("mandi_prices/serializers.py", """
from rest_framework import serializers
from .models import MandiCommodityPrice

class MandiCommodityPriceSerializer(serializers.ModelSerializer):
    crop = serializers.CharField(source='crop_name')
    mandi = serializers.CharField(source='mandi_name')
    price = serializers.IntegerField(source='modal_price')
    prev = serializers.IntegerField(source='previous_price')
    change = serializers.CharField(source='price_change_percent')
    msp = serializers.IntegerField(source='msp_rate')
    arrival = serializers.CharField(source='daily_arrival')

    class Meta:
        model = MandiCommodityPrice
        fields = [
            'id', 'crop', 'crop_name_native', 'mandi', 'district',
            'state', 'price', 'prev', 'change', 'msp', 'arrival', 'updated_at'
        ]
""")

    write_file("mandi_prices/views.py", """
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from .models import MandiCommodityPrice
from .serializers import MandiCommodityPriceSerializer

class MandiPriceListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        search = request.query_params.get('search', '')
        crop = request.query_params.get('crop', '')
        mandi = request.query_params.get('mandi', '')

        queryset = MandiCommodityPrice.objects.all()
        if search:
            queryset = queryset.filter(
                Q(crop_name__icontains=search) |
                Q(crop_name_native__icontains=search) |
                Q(mandi_name__icontains=search)
            )
        if crop:
            queryset = queryset.filter(crop_name__icontains=crop)
        if mandi:
            queryset = queryset.filter(mandi_name__icontains=mandi)

        serializer = MandiCommodityPriceSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MandiPriceSummaryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        prices = MandiCommodityPrice.objects.all()
        gainers = prices.filter(price_change_percent__startswith='+')[:3]
        total_commodities = prices.count()
        return Response({
            "total_commodities_tracked": total_commodities,
            "top_gainers": MandiCommodityPriceSerializer(gainers, many=True).data
        }, status=status.HTTP_200_OK)
""")

    write_file("mandi_prices/urls.py", """
from django.urls import path
from .views import MandiPriceListView, MandiPriceSummaryView

urlpatterns = [
    path('', MandiPriceListView.as_view(), name='mandi-prices-list'),
    path('summary/', MandiPriceSummaryView.as_view(), name='mandi-prices-summary'),
]
""")

    # 7. govt_schemes module
    write_file("govt_schemes/models.py", """
from django.db import models

class GovtScheme(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.TextField()
    category = models.CharField(max_length=100, default='Central Scheme')
    benefit_amount = models.CharField(max_length=150)
    eligibility = models.TextField()
    required_documents = models.JSONField(default=list)
    application_status = models.CharField(max_length=100, default='Applications Open')
    official_portal_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
""")

    write_file("govt_schemes/serializers.py", """
from rest_framework import serializers
from .models import GovtScheme

class GovtSchemeSerializer(serializers.ModelSerializer):
    tag = serializers.CharField(source='category')
    benefit = serializers.CharField(source='benefit_amount')
    status = serializers.CharField(source='application_status')
    documents = serializers.ListField(source='required_documents')
    link = serializers.URLField(source='official_portal_url')

    class Meta:
        model = GovtScheme
        fields = [
            'id', 'title', 'subtitle', 'tag', 'benefit',
            'eligibility', 'documents', 'status', 'link', 'created_at'
        ]
""")

    write_file("govt_schemes/views.py", """
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import GovtScheme
from .serializers import GovtSchemeSerializer

class GovtSchemeListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category', '')
        schemes = GovtScheme.objects.all()
        if category and category != 'all':
            schemes = schemes.filter(category__icontains=category)
        return Response(GovtSchemeSerializer(schemes, many=True).data, status=status.HTTP_200_OK)

class GovtSchemeDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            scheme = GovtScheme.objects.get(pk=pk)
            return Response(GovtSchemeSerializer(scheme).data, status=status.HTTP_200_OK)
        except GovtScheme.DoesNotExist:
            return Response({"detail": "Scheme not found"}, status=status.HTTP_404_NOT_FOUND)
""")

    write_file("govt_schemes/urls.py", """
from django.urls import path
from .views import GovtSchemeListView, GovtSchemeDetailView

urlpatterns = [
    path('', GovtSchemeListView.as_view(), name='schemes-list'),
    path('<int:pk>/', GovtSchemeDetailView.as_view(), name='scheme-detail'),
]
""")

    # 8. weather_advisory module
    write_file("weather_advisory/models.py", """
from django.db import models

class WeatherReport(models.Model):
    location_name = models.CharField(max_length=150, default='Guntur District, AP')
    temperature = models.CharField(max_length=20, default='32°C')
    feels_like = models.CharField(max_length=20, default='36°C')
    condition = models.CharField(max_length=100, default='Partly Cloudy')
    humidity = models.CharField(max_length=20, default='68%')
    wind_speed = models.CharField(max_length=20, default='14 km/h')
    rain_probability = models.CharField(max_length=20, default='20%')
    uv_index = models.CharField(max_length=20, default='High')
    advisory_headline = models.CharField(
        max_length=255,
        default='Agro-Advisory: Moderate Rain expected Sunday & Monday'
    )
    advisory_detail = models.TextField(
        default='Hold pesticide/fertilizer spraying until Tuesday to avoid chemical wash-off. Ensure field drainage channels are clear for standing cotton & chilli crops.'
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.location_name} - {self.temperature}"

class DailyForecast(models.Model):
    weather_report = models.ForeignKey(WeatherReport, on_delete=models.CASCADE, related_name='forecast_days', null=True, blank=True)
    day = models.CharField(max_length=50)
    temp = models.CharField(max_length=50)
    condition = models.CharField(max_length=100)
    rain = models.CharField(max_length=20)
    icon = models.CharField(max_length=50, default='CloudSun')

    def __str__(self):
        return f"{self.day}: {self.temp} ({self.condition})"
""")

    write_file("weather_advisory/serializers.py", """
from rest_framework import serializers
from .models import WeatherReport, DailyForecast

class DailyForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyForecast
        fields = ['id', 'day', 'temp', 'condition', 'rain', 'icon']

class WeatherReportSerializer(serializers.ModelSerializer):
    forecast = DailyForecastSerializer(source='forecast_days', many=True, read_only=True)

    class Meta:
        model = WeatherReport
        fields = [
            'id', 'location_name', 'temperature', 'feels_like',
            'condition', 'humidity', 'wind_speed', 'rain_probability',
            'uv_index', 'advisory_headline', 'advisory_detail',
            'forecast', 'updated_at'
        ]
""")

    write_file("weather_advisory/views.py", """
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import WeatherReport, DailyForecast
from .serializers import WeatherReportSerializer, DailyForecastSerializer

class CurrentWeatherView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        report = WeatherReport.objects.first()
        if not report:
            return Response({
                "location_name": "Guntur District, AP",
                "temperature": "32°C",
                "feels_like": "36°C",
                "condition": "Partly Cloudy",
                "humidity": "68%",
                "wind_speed": "14 km/h",
                "rain_probability": "20%",
                "uv_index": "High",
                "advisory_headline": "Agro-Advisory: Moderate Rain expected Sunday & Monday",
                "advisory_detail": "Hold pesticide/fertilizer spraying until Tuesday to avoid chemical wash-off. Ensure field drainage channels are clear for standing cotton & chilli crops."
            }, status=status.HTTP_200_OK)
        return Response(WeatherReportSerializer(report).data, status=status.HTTP_200_OK)

class WeatherForecastView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        forecasts = DailyForecast.objects.all()
        return Response(DailyForecastSerializer(forecasts, many=True).data, status=status.HTTP_200_OK)
""")

    write_file("weather_advisory/urls.py", """
from django.urls import path
from .views import CurrentWeatherView, WeatherForecastView

urlpatterns = [
    path('current/', CurrentWeatherView.as_view(), name='weather-current'),
    path('forecast/', WeatherForecastView.as_view(), name='weather-forecast'),
]
""")

    # 9. community module
    write_file("community/models.py", """
from django.db import models

class ForumPost(models.Model):
    author = models.CharField(max_length=120)
    location = models.CharField(max_length=150)
    crop = models.CharField(max_length=100, default='All Crops')
    content = models.TextField()
    time_ago = models.CharField(max_length=50, default='Just now')
    likes = models.IntegerField(default=0)
    replies_count = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    is_rental = models.BooleanField(default=False)
    is_official = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author} ({self.crop}): {self.content[:40]}"

class PostReply(models.Model):
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name='replies')
    author = models.CharField(max_length=120)
    is_scientist = models.BooleanField(default=False)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply by {self.author} on Post #{self.post.id}"
""")

    write_file("community/serializers.py", """
from rest_framework import serializers
from .models import ForumPost, PostReply

class PostReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = PostReply
        fields = ['id', 'author', 'is_scientist', 'content', 'created_at']

class ForumPostSerializer(serializers.ModelSerializer):
    replies_list = PostReplySerializer(source='replies', many=True, read_only=True)
    replies = serializers.IntegerField(source='replies_count', read_only=True)

    class Meta:
        model = ForumPost
        fields = [
            'id', 'author', 'location', 'crop', 'content',
            'time_ago', 'likes', 'replies', 'replies_list',
            'is_verified', 'is_rental', 'is_official', 'created_at'
        ]
""")

    write_file("community/views.py", """
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import ForumPost, PostReply
from .serializers import ForumPostSerializer, PostReplySerializer

class ForumPostListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        posts = ForumPost.objects.all().order_by('-created_at')
        return Response(ForumPostSerializer(posts, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ForumPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(time_ago='Just now')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LikePostView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            post = ForumPost.objects.get(pk=pk)
            post.likes += 1
            post.save()
            return Response({"likes": post.likes}, status=status.HTTP_200_OK)
        except ForumPost.DoesNotExist:
            return Response({"detail": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

class AddReplyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            post = ForumPost.objects.get(pk=pk)
            author = request.data.get('author', 'Kisan Brother')
            content = request.data.get('content', '')
            if not content:
                return Response({"detail": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            reply = PostReply.objects.create(
                post=post,
                author=author,
                content=content
            )
            post.replies_count = post.replies.count()
            post.save()
            return Response(PostReplySerializer(reply).data, status=status.HTTP_201_CREATED)
        except ForumPost.DoesNotExist:
            return Response({"detail": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
""")

    write_file("community/urls.py", """
from django.urls import path
from .views import ForumPostListCreateView, LikePostView, AddReplyView

urlpatterns = [
    path('posts/', ForumPostListCreateView.as_view(), name='posts-list-create'),
    path('posts/<int:pk>/like/', LikePostView.as_view(), name='post-like'),
    path('posts/<int:pk>/reply/', AddReplyView.as_view(), name='post-reply'),
]
""")

    # 10. Seed Data Management Command
    write_file("authentication/management/commands/seed_data.py", """
from django.core.management.base import BaseCommand
from authentication.models import FarmerProfile
from disease_detection.models import CropDiseaseKnowledge
from mandi_prices.models import MandiCommodityPrice
from govt_schemes.models import GovtScheme
from weather_advisory.models import WeatherReport, DailyForecast
from community.models import ForumPost, PostReply

class Command(BaseCommand):
    help = 'Seeds realistic Indian agricultural data for RaithuSetu backend'

    def handle(self, *args, **options):
        self.stdout.write("Seeding RaithuSetu initial data...")

        # 1. Farmer Profile
        FarmerProfile.objects.get_or_create(
            phone='9876543210',
            defaults={
                'name': 'Ramesh Patel',
                'name_native': 'రమేష్ పటేల్',
                'village': 'Pedakakani',
                'district': 'Guntur',
                'state': 'Andhra Pradesh',
                'total_land': '6.5 Acres',
                'soil_type': 'Black Clay Loam (నల్లరేగడి నేల)',
                'irrigation_source': 'Borewell + Canal',
                'active_crops': ['Paddy (BPT 5204)', 'Chilli (Teja Variety)']
            }
        )

        # 2. Disease Knowledge Base
        diseases = [
            {
                'crop_name': 'Tomato (టమాటా / टमाटर)',
                'crop_name_native': 'టమాట',
                'disease_name': 'Early Blight (Alternaria solani)',
                'scientific_name': 'Alternaria solani',
                'severity': 'Moderate',
                'confidence_default': 96.4,
                'symptoms': 'Concentric dark brown rings on older lower leaves resembling a target board.',
                'organic_solution': 'Spray Neem Oil (5ml/liter) or Trichoderma viride bio-fungicide once every 7 days.',
                'chemical_solution': 'Apply Mancozeb 75% WP @ 2.5g/liter or Azoxystrobin 23% SC @ 1ml/liter in the evening.',
                'prevention_advice': 'Avoid overhead irrigation, prune infected lower leaves, and maintain proper crop spacing.'
            },
            {
                'crop_name': 'Paddy / Rice (వరి / धान)',
                'crop_name_native': 'వరి',
                'disease_name': 'Leaf Blast (Pyricularia oryzae)',
                'scientific_name': 'Magnaporthe oryzae',
                'severity': 'High',
                'confidence_default': 94.8,
                'symptoms': 'Spindle-shaped elliptical lesions with greyish center and brownish margins on leaf blades.',
                'organic_solution': 'Spray Pseudomonas fluorescens @ 10g/liter or fermented butter milk spray.',
                'chemical_solution': 'Spray Tricyclazole 75% WP @ 0.6g/liter or Isoprothiolane 40% EC @ 1.5ml/liter.',
                'prevention_advice': 'Avoid excessive nitrogen fertilizer application during cloudy and high humidity weather.'
            },
            {
                'crop_name': 'Cotton (పత్తి / कपास)',
                'crop_name_native': 'పత్తి',
                'disease_name': 'Cotton Leaf Curl Disease (CLCuD)',
                'scientific_name': 'Begomovirus',
                'severity': 'High',
                'confidence_default': 95.2,
                'symptoms': 'Upward or downward leaf curling, thickened veins, and enation on undersides.',
                'organic_solution': 'Apply yellow sticky traps (10/acre) and spray 5% NSKE (Neem Seed Kernel Extract).',
                'chemical_solution': 'Control whitefly vector with Diafenthiuron 50% WP @ 1.2g/L or Flonicamid 50% WG @ 0.3g/L.',
                'prevention_advice': 'Eradicate weed hosts like Abutilon and Parthenium near field borders.'
            }
        ]
        for d in diseases:
            CropDiseaseKnowledge.objects.get_or_create(disease_name=d['disease_name'], defaults=d)

        # 3. Mandi Prices
        mandi_records = [
            { 'crop_name': 'Wheat (గోధుమ / गेहूं)', 'crop_name_native': 'గోధుమ', 'mandi_name': 'Guntur APMC, AP', 'district': 'Guntur', 'modal_price': 2380, 'previous_price': 2320, 'price_change_percent': '+2.5%', 'msp_rate': 2275, 'daily_arrival': '450 Quintals' },
            { 'crop_name': 'Paddy / Rice (వరి / धान)', 'crop_name_native': 'వరి', 'mandi_name': 'Warangal Mandi, TS', 'district': 'Warangal', 'modal_price': 2240, 'previous_price': 2260, 'price_change_percent': '-0.8%', 'msp_rate': 2203, 'daily_arrival': '820 Quintals' },
            { 'crop_name': 'Cotton (పత్తి / कपास)', 'crop_name_native': 'పత్తి', 'mandi_name': 'Adilabad APMC, TS', 'district': 'Adilabad', 'modal_price': 7450, 'previous_price': 7200, 'price_change_percent': '+3.4%', 'msp_rate': 7020, 'daily_arrival': '310 Quintals' },
            { 'crop_name': 'Chilli (మిరప / मिर्च)', 'crop_name_native': 'మిరప', 'mandi_name': 'Khammam Yard, TS', 'district': 'Khammam', 'modal_price': 14500, 'previous_price': 14200, 'price_change_percent': '+2.1%', 'msp_rate': 13800, 'daily_arrival': '190 Quintals' },
            { 'crop_name': 'Tomato (టమాట / टमाटर)', 'crop_name_native': 'టమాట', 'mandi_name': 'Madanapalle, AP', 'district': 'Annamayya', 'modal_price': 1800, 'previous_price': 2100, 'price_change_percent': '-14.2%', 'msp_rate': 1500, 'daily_arrival': '1400 Crates' },
            { 'crop_name': 'Onion (ఉల్లిపాయ / प्याज)', 'crop_name_native': 'ఉల్లిపాయ', 'mandi_name': 'Lasalgaon / Kurnool', 'district': 'Kurnool', 'modal_price': 2150, 'previous_price': 2050, 'price_change_percent': '+4.8%', 'msp_rate': 1900, 'daily_arrival': '680 Quintals' },
        ]
        for m in mandi_records:
            MandiCommodityPrice.objects.get_or_create(crop_name=m['crop_name'], mandi_name=m['mandi_name'], defaults=m)

        # 4. Govt Schemes
        schemes = [
            {
                'title': 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
                'subtitle': 'Direct income support of ₹6,000/year in 3 equal installments.',
                'category': 'Central Scheme',
                'benefit_amount': '₹6,000 / Year',
                'eligibility': 'All small & marginal landholder farmer families with cultivable land.',
                'application_status': 'Applications Open',
                'required_documents': ['Aadhaar Card', 'Land Ownership Records (Pattadar Passbook)', 'Bank Account Details'],
                'official_portal_url': 'https://pmkisan.gov.in'
            },
            {
                'title': 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
                'subtitle': 'Comprehensive crop insurance against drought, floods, pests & unseasonal rains.',
                'category': 'Crop Insurance',
                'benefit_amount': 'Up to 100% Crop Loss Cover',
                'eligibility': 'All farmers growing notified crops in notified areas (loanee & non-loanee).',
                'application_status': 'Kharif Window Active',
                'required_documents': ['Sowing Certificate', 'Land Record', 'Bank Passbook'],
                'official_portal_url': 'https://pmfby.gov.in'
            },
            {
                'title': 'Kisan Credit Card (KCC) Scheme',
                'subtitle': 'Low-interest short term agriculture credit up to ₹3,00,000 at 4% subsidized interest rate.',
                'category': 'Low Interest Loan',
                'benefit_amount': 'Up to ₹3 Lakh at 4% Interest',
                'eligibility': 'Individual/joint farmers, tenant farmers, self-help groups (SHGs).',
                'application_status': 'Available at all National Banks',
                'required_documents': ['Land Records', 'ID Proof', 'Recent Passport Photos'],
                'official_portal_url': 'https://myscheme.gov.in'
            },
            {
                'title': 'PM-KUSUM Solar Agriculture Pump Subsidy',
                'subtitle': 'Up to 60% financial subsidy for installing standalone solar irrigation pumps.',
                'category': 'Solar & Irrigation',
                'benefit_amount': '60% Govt Subsidy on Solar Pumps',
                'eligibility': 'Farmers, farmer producer organizations (FPOs), cooperatives.',
                'application_status': 'State Quota Open',
                'required_documents': ['Land ownership copy', 'Electricity clearance', 'Aadhaar'],
                'official_portal_url': 'https://pmkusum.mnre.gov.in'
            }
        ]
        for s in schemes:
            GovtScheme.objects.get_or_create(title=s['title'], defaults=s)

        # 5. Weather Advisory
        report, _ = WeatherReport.objects.get_or_create(
            location_name='Guntur District, AP',
            defaults={
                'temperature': '32°C',
                'feels_like': '36°C',
                'condition': 'Partly Cloudy',
                'humidity': '68%',
                'wind_speed': '14 km/h',
                'rain_probability': '20%',
                'uv_index': 'High',
                'advisory_headline': 'Agro-Advisory: Moderate Rain expected Sunday & Monday',
                'advisory_detail': 'Hold pesticide/fertilizer spraying until Tuesday to avoid chemical wash-off. Ensure field drainage channels are clear for standing cotton & chilli crops.'
            }
        )

        forecasts = [
            { 'day': 'Today (Sat)', 'temp': '32°C / 24°C', 'condition': 'Partly Cloudy', 'rain': '20%', 'icon': 'CloudSun' },
            { 'day': 'Sun', 'temp': '30°C / 23°C', 'condition': 'Scattered Showers', 'rain': '65%', 'icon': 'CloudRain' },
            { 'day': 'Mon', 'temp': '29°C / 22°C', 'condition': 'Moderate Rain', 'rain': '80%', 'icon': 'CloudRain' },
            { 'day': 'Tue', 'temp': '31°C / 23°C', 'condition': 'Sunny & Humid', 'rain': '10%', 'icon': 'Sun' },
            { 'day': 'Wed', 'temp': '33°C / 24°C', 'condition': 'Clear Sky', 'rain': '5%', 'icon': 'Sun' },
            { 'day': 'Thu', 'temp': '34°C / 25°C', 'condition': 'Hot & Clear', 'rain': '0%', 'icon': 'Sun' },
        ]
        for f in forecasts:
            DailyForecast.objects.get_or_create(weather_report=report, day=f['day'], defaults=f)

        # 6. Community Posts
        posts = [
            {
                'author': 'Venkat Rao',
                'location': 'Tenali, Andhra Pradesh',
                'crop': 'Paddy / BPT 5204',
                'time_ago': '2 hours ago',
                'content': 'Has anyone started harvesting Samba Mahsuri in Guntur delta? What moisture percentage are the millers accepting this week at the yard?',
                'likes': 18,
                'replies_count': 2,
                'is_verified': True
            },
            {
                'author': 'Suresh Reddy',
                'location': 'Suryapet, Telangana',
                'crop': 'Cotton & Chilli',
                'time_ago': '5 hours ago',
                'content': 'John Deere 5050D (50 HP) Tractor available with Rotavator & MB Plough for rent @ ₹750/hour in Suryapet mandal. Contact me on WhatsApp.',
                'likes': 24,
                'replies_count': 1,
                'is_rental': True
            },
            {
                'author': 'Dr. Ananya Sharma (Agri Scientist)',
                'location': 'ANGRAU Research Station',
                'crop': 'All Crops',
                'time_ago': '1 day ago',
                'content': 'Farmer advisory: High humidity this week increases risk of False Smut in late-sown paddy. Spray Copper Oxychloride (2.5g/L) during boot leaf stage.',
                'likes': 56,
                'replies_count': 3,
                'is_official': True
            }
        ]
        for p in posts:
            post_obj, created = ForumPost.objects.get_or_create(author=p['author'], content=p['content'], defaults=p)
            if created:
                PostReply.objects.create(
                    post=post_obj,
                    author='Ramesh Patel',
                    content='Thank you for sharing this crucial advisory for our Guntur cluster!'
                )

        self.stdout.write(self.style.SUCCESS("RaithuSetu seed data inserted successfully!"))
""")

    print("All backend code successfully written to C:\\Users\\hp\\Desktop\\Farm-BAck")

if __name__ == "__main__":
    main()
