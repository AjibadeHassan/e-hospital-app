from rest_framework import serializers
from .models import Prescription, Medicine

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'generic_name', 'strength', 'form', 'manufacturer']

class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    doctor_email = serializers.CharField(source='doctor.email', read_only=True)
    medicine_details = MedicineSerializer(source='medicine', read_only=True)
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'doctor_email',
            'medicine', 'medicine_details', 'dosage', 'frequency', 'duration', 'instructions',
            'quantity', 'refills', 'refills_remaining', 'status', 'prescription_date',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient', 'doctor', 'created_at', 'updated_at', 'refills_remaining']
    
    def validate_prescription_date(self, value):
        """Validate prescription date is not in the future"""
        from django.utils import timezone
        from datetime import date
        if value > timezone.now().date():
            raise serializers.ValidationError("Prescription date cannot be in the future")
        return value
    
    def validate_quantity(self, value):
        """Validate quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
