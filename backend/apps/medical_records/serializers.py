from rest_framework import serializers
from .models import MedicalRecord

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    doctor_email = serializers.CharField(source='doctor.email', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'doctor_email',
            'record_type', 'title', 'description', 'findings', 'recommendations',
            'record_date', 'file_attachment', 'file_url', 'is_verified',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'doctor', 'patient', 'created_at', 'updated_at']
    
    def get_file_url(self, obj):
        """Get the file URL if attachment exists"""
        if obj.file_attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file_attachment.url)
            return obj.file_attachment.url
        return None
    
    def validate_record_date(self, value):
        """Validate record date is not in the future"""
        from django.utils import timezone
        from datetime import date
        if value > timezone.now().date():
            raise serializers.ValidationError("Record date cannot be in the future")
        return value
