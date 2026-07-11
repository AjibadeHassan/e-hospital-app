from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views import UserViewSet
from apps.appointments.views import DepartmentViewSet, AppointmentViewSet, AppointmentSlotViewSet
from apps.notifications.views import NotificationViewSet, NotificationPreferenceViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'appointment-slots', AppointmentSlotViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
]
