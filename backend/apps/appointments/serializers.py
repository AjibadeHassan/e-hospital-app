from rest_framework import serializers
from .models import Appointment, Department
from apps.users.serializers import UserListSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'head_doctor', 'contact_number']

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    doctor_email = serializers.CharField(source='doctor.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'doctor_email',
            'department', 'department_name', 'appointment_date', 'reason', 'notes',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient', 'created_at', 'updated_at', 'status']
    
    def validate_appointment_date(self, value):
        """Validate that appointment is in the future"""
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError("Appointment date must be in the future")
        return value
