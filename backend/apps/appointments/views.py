from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from .models import Department, Appointment, AppointmentSlot
from .serializers import (
    DepartmentSerializer, AppointmentSerializer,
    AppointmentDetailSerializer, AppointmentCreateSerializer,
    AppointmentSlotSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def doctors(self, request, pk=None):
        """Get all doctors in a department"""
        department = self.get_object()
        doctors = department.head.filter(role='doctor')
        from apps.users.serializers import UserSerializer
        serializer = UserSerializer(doctors, many=True)
        return Response(serializer.data)

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return Appointment.objects.filter(patient=user)
        elif user.role == 'doctor':
            return Appointment.objects.filter(doctor=user)
        return Appointment.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        elif self.action == 'retrieve':
            return AppointmentDetailSerializer
        return AppointmentSerializer
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming appointments"""
        appointments = self.get_queryset().filter(
            appointment_date__gte=timezone.now(),
            status='scheduled'
        )
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past appointments"""
        appointments = self.get_queryset().filter(
            appointment_date__lt=timezone.now()
        )
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment_id = request.data.get('appointment_id')
        try:
            appointment = self.get_queryset().get(id=appointment_id)
            if appointment.status != 'scheduled':
                return Response(
                    {'detail': 'Only scheduled appointments can be cancelled.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            appointment.status = 'cancelled'
            appointment.save()
            return Response(
                {'detail': 'Appointment cancelled successfully.'},
                status=status.HTTP_200_OK
            )
        except Appointment.DoesNotExist:
            return Response(
                {'detail': 'Appointment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

class AppointmentSlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AppointmentSlot.objects.filter(is_available=True)
    serializer_class = AppointmentSlotSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available appointment slots"""
        doctor_id = request.query_params.get('doctor_id')
        date = request.query_params.get('date')
        
        slots = AppointmentSlot.objects.filter(is_available=True)
        
        if doctor_id:
            slots = slots.filter(doctor_id=doctor_id)
        if date:
            slots = slots.filter(date=date)
        
        serializer = self.get_serializer(slots, many=True)
        return Response(serializer.data)
