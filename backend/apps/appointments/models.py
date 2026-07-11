from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from datetime import timedelta

User = get_user_model()

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    head = models.OneToOneField(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        limit_choices_to={'role': 'doctor'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Departments'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    patient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='appointments_as_patient',
        limit_choices_to={'role': 'patient'}
    )
    doctor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='appointments_as_doctor',
        limit_choices_to={'role': 'doctor'}
    )
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    appointment_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-appointment_date']
        unique_together = ('doctor', 'appointment_date')
    
    def clean(self):
        if self.patient.role != 'patient':
            raise ValidationError('Patient must have patient role')
        if self.doctor.role != 'doctor':
            raise ValidationError('Doctor must have doctor role')
        if self.appointment_date < models.F('created_at'):
            raise ValidationError('Appointment date cannot be in the past')
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.doctor.get_full_name()} ({self.appointment_date})"

class AppointmentSlot(models.Model):
    doctor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='appointment_slots',
        limit_choices_to={'role': 'doctor'}
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.IntegerField(default=30)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('doctor', 'date', 'start_time')
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return f"{self.doctor.get_full_name()} - {self.date} {self.start_time}"
