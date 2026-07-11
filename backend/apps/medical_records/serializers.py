from rest_framework import serializers
from apps.medical_records.models import MedicalRecord, LabResult, Diagnosis
from apps.prescriptions.models import Prescription, Medication, PharmacyOrder

class LabResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabResult
        fields = ['id', 'test_name', 'test_code', 'result_value', 'normal_range', 
                  'unit', 'status']

class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = ['id', 'disease_name', 'icd_code', 'severity', 'onset_date', 'status']

class MedicalRecordSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    lab_result = LabResultSerializer(read_only=True)
    diagnosis = DiagnosisSerializer(read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient', 'doctor', 'doctor_name', 'record_type', 'title',
                  'description', 'findings', 'recommendations', 'record_date',
                  'document', 'is_verified', 'lab_result', 'diagnosis', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['id', 'drug_name', 'strength', 'dosage_form', 'quantity', 'frequency',
                  'duration_days', 'route', 'instructions', 'side_effects',
                  'contraindications', 'created_at']
        read_only_fields = ['created_at']

class PrescriptionSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    medications = MedicationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'doctor', 'doctor_name', 'prescription_date',
                  'issue_date', 'expiry_date', 'notes', 'is_active', 'medications',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'prescription_date']

class PharmacyOrderSerializer(serializers.ModelSerializer):
    pharmacist_name = serializers.CharField(source='pharmacist.get_full_name', read_only=True)
    prescription_detail = PrescriptionSerializer(source='prescription', read_only=True)
    
    class Meta:
        model = PharmacyOrder
        fields = ['id', 'prescription', 'prescription_detail', 'pharmacist',
                  'pharmacist_name', 'status', 'prepared_date', 'completed_date',
                  'total_cost', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
