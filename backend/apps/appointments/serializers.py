from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Department, Appointment, AppointmentSlot
from apps.users.serializers import UserSerializer

User = get_user_model()

class DepartmentSerializer(serializers.ModelSerializer):
    head_detail = UserSerializer(source='head', read_only=True)
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'head', 'head_detail', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class AppointmentSlotSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    
    class Meta:
        model = AppointmentSlot
        fields = ['id', 'doctor', 'doctor_name', 'date', 'start_time', 'end_time', 
                  'duration_minutes', 'is_available', 'created_at']
        read_only_fields = ['created_at']

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'department', 'department_name', 'appointment_date', 'duration_minutes',
            'reason', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class AppointmentDetailSerializer(AppointmentSerializer):
    patient_detail = UserSerializer(source='patient', read_only=True)
    doctor_detail = UserSerializer(source='doctor', read_only=True)
    department_detail = DepartmentSerializer(source='department', read_only=True)
    
    class Meta(AppointmentSerializer.Meta):
        fields = AppointmentSerializer.Meta.fields + [
            'patient_detail', 'doctor_detail', 'department_detail'
        ]

class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['patient', 'doctor', 'department', 'appointment_date', 
                  'duration_minutes', 'reason', 'notes']
    
    def validate(self, data):
        if data['patient'].role != 'patient':
            raise serializers.ValidationError('Patient must have patient role')
        if data['doctor'].role != 'doctor':
            raise serializers.ValidationError('Doctor must have doctor role')
        return data
