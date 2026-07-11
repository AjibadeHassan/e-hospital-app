from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class MedicalRecord(models.Model):
    patient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='medical_records',
        limit_choices_to={'role': 'patient'}
    )
    doctor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        limit_choices_to={'role': 'doctor'}
    )
    record_type = models.CharField(
        max_length=50,
        choices=[
            ('diagnosis', 'Diagnosis'),
            ('treatment', 'Treatment'),
            ('lab_result', 'Lab Result'),
            ('imaging', 'Imaging'),
            ('vaccination', 'Vaccination'),
            ('surgery', 'Surgery'),
            ('other', 'Other'),
        ]
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    findings = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    record_date = models.DateField()
    document = models.FileField(upload_to='medical_records/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-record_date']
        verbose_name = 'Medical Record'
        verbose_name_plural = 'Medical Records'
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.get_record_type_display()} ({self.record_date})"

class LabResult(models.Model):
    medical_record = models.OneToOneField(
        MedicalRecord, on_delete=models.CASCADE, related_name='lab_result'
    )
    test_name = models.CharField(max_length=255)
    test_code = models.CharField(max_length=50)
    result_value = models.CharField(max_length=255)
    normal_range = models.CharField(max_length=255, blank=True)
    unit = models.CharField(max_length=50, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('normal', 'Normal'),
            ('abnormal', 'Abnormal'),
            ('critical', 'Critical'),
        ],
        default='normal'
    )
    
    class Meta:
        verbose_name = 'Lab Result'
        verbose_name_plural = 'Lab Results'
    
    def __str__(self):
        return f"{self.test_name} - {self.status}"

class Diagnosis(models.Model):
    medical_record = models.OneToOneField(
        MedicalRecord, on_delete=models.CASCADE, related_name='diagnosis'
    )
    disease_name = models.CharField(max_length=255)
    icd_code = models.CharField(max_length=50, blank=True)
    severity = models.CharField(
        max_length=20,
        choices=[
            ('mild', 'Mild'),
            ('moderate', 'Moderate'),
            ('severe', 'Severe'),
        ]
    )
    onset_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('resolved', 'Resolved'),
        ],
        default='active'
    )
    
    class Meta:
        verbose_name = 'Diagnosis'
        verbose_name_plural = 'Diagnoses'
    
    def __str__(self):
        return f"{self.disease_name} - {self.get_severity_display()}"
