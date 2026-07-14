from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.utils import timezone
from .models import Appointment, Department
from .serializers import AppointmentSerializer, DepartmentSerializer

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for departments - read only"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for appointments"""
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get appointments for current user"""
        user = self.request.user
        if user.role == 'patient':
            return Appointment.objects.filter(patient=user)
        elif user.role == 'doctor':
            return Appointment.objects.filter(doctor=user)
        else:
            return Appointment.objects.all()
    
    def perform_create(self, serializer):
        """Create appointment with current user as patient"""
        serializer.save(patient=self.request.user)
    
    @extend_schema(
        description="Get available time slots for a doctor on a specific date",
        parameters=[
            {'name': 'doctor_id', 'in': 'query', 'type': 'integer'},
            {'name': 'date', 'in': 'query', 'type': 'string', 'format': 'date'}
        ]
    )
    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """Get available time slots for a doctor"""
        doctor_id = request.query_params.get('doctor_id')
        date_str = request.query_params.get('date')
        
        if not doctor_id or not date_str:
            return Response(
                {'detail': 'doctor_id and date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from django.utils.dateparse import parse_date
            appointment_date = parse_date(date_str)
            
            # Define time slots (30-minute intervals)
            from datetime import datetime, time, timedelta
            slots = []
            start_time = time(9, 0)
            end_time = time(17, 0)
            
            current_time = datetime.combine(appointment_date, start_time)
            end_datetime = datetime.combine(appointment_date, end_time)
            
            # Get booked appointments for this doctor on this date
            booked_slots = Appointment.objects.filter(
                doctor_id=doctor_id,
                appointment_date__date=appointment_date,
                status__in=['scheduled', 'confirmed']
            ).values_list('appointment_date', flat=True)
            
            booked_times = [dt.time() for dt in booked_slots]
            
            while current_time < end_datetime:
                slot_time = current_time.time()
                if slot_time not in booked_times:
                    slots.append({
                        'time': slot_time.strftime('%H:%M'),
                        'available': True
                    })
                current_time += timedelta(minutes=30)
            
            return Response({
                'date': appointment_date,
                'doctor_id': doctor_id,
                'slots': slots
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @extend_schema(
        description="Cancel an appointment",
    )
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {'detail': 'Appointment is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if appointment.appointment_date < timezone.now():
            return Response(
                {'detail': 'Cannot cancel past appointments'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        return Response(
            {'message': 'Appointment cancelled successfully'},
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        description="Reschedule an appointment",
    )
    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Reschedule an appointment"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {'detail': 'Cannot reschedule cancelled appointment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AppointmentSerializer(appointment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(status='rescheduled')
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        description="Get doctor details for appointment booking",
    )
    @action(detail=False, methods=['get'])
    def doctors(self, request):
        """Get list of available doctors"""
        from apps.users.models import User
        doctors = User.objects.filter(role='doctor')
        from apps.users.serializers import UserSerializer
        serializer = UserSerializer(doctors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
