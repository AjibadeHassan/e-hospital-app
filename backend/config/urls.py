from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from apps.users.auth_views import (
    login_view, register_view, profile_view, 
    update_profile_view, logout_view
)
from apps.appointments.views import AppointmentViewSet, DepartmentViewSet

# Create a router and register the viewsets
router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'departments', DepartmentViewSet, basename='department')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema')),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema')),
    
    # Authentication Endpoints
    path('api/users/login/', login_view, name='login'),
    path('api/users/register/', register_view, name='register'),
    path('api/users/profile/', profile_view, name='profile'),
    path('api/users/profile/update/', update_profile_view, name='update-profile'),
    path('api/users/logout/', logout_view, name='logout'),
    path('api/auth-token/', obtain_auth_token, name='auth-token'),
    
    # API Routes
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
]
