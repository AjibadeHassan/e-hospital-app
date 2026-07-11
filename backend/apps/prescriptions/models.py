from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Prescription(models.Model):
    patient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='prescriptions',
        limit_choices_to={'role': 'patient'}
    )
    doctor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        limit_choices_to={'role': 'doctor'}
    )
    prescription_date = models.DateField(auto_now_add=True)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-issue_date']
        verbose_name = 'Prescription'
        verbose_name_plural = 'Prescriptions'
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.issue_date}"

class Medication(models.Model):
    prescription = models.ForeignKey(
        Prescription, on_delete=models.CASCADE, related_name='medications'
    )
    drug_name = models.CharField(max_length=255)
    strength = models.CharField(max_length=100)
    dosage_form = models.CharField(
        max_length=50,
        choices=[
            ('tablet', 'Tablet'),
            ('capsule', 'Capsule'),
            ('liquid', 'Liquid'),
            ('injection', 'Injection'),
            ('cream', 'Cream'),
            ('drops', 'Drops'),
            ('powder', 'Powder'),
            ('other', 'Other'),
        ]
    )
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    frequency = models.CharField(
        max_length=100,
        help_text='E.g., "Once daily", "Twice daily", "Every 8 hours"'
    )
    duration_days = models.IntegerField(validators=[MinValueValidator(1)])
    route = models.CharField(
        max_length=50,
        choices=[
            ('oral', 'Oral'),
            ('topical', 'Topical'),
            ('injection', 'Injection'),
            ('inhalation', 'Inhalation'),
            ('rectal', 'Rectal'),
            ('other', 'Other'),
        ]
    )
    instructions = models.TextField(blank=True, help_text='Special instructions for patient')
    side_effects = models.TextField(blank=True, help_text='Known side effects')
    contraindications = models.TextField(blank=True, help_text='Contraindications and warnings')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['prescription', '-created_at']
        verbose_name = 'Medication'
        verbose_name_plural = 'Medications'
    
    def __str__(self):
        return f"{self.drug_name} - {self.strength}"

class PharmacyOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready for Pickup'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    prescription = models.OneToOneField(
        Prescription, on_delete=models.CASCADE, related_name='pharmacy_order'
    )
    pharmacist = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        limit_choices_to={'role': 'pharmacist'}
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    prepared_date = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pharmacy Order'
        verbose_name_plural = 'Pharmacy Orders'
    
    def __str__(self):
        return f"Order for {self.prescription.patient.get_full_name()} - {self.status}"
