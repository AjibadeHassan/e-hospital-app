import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command
from apps.users.models import User
from apps.appointments.models import Department
from django.utils import timezone
from datetime import timedelta

def create_departments():
    """Create sample departments"""
    departments = [
        {
            'name': 'Cardiology',
            'description': 'Heart and cardiovascular system care',
            'contact_number': '+1-800-HEART-1'
        },
        {
            'name': 'Neurology',
            'description': 'Brain and nervous system disorders',
            'contact_number': '+1-800-NEURO-2'
        },
        {
            'name': 'Orthopedics',
            'description': 'Bone and joint disorders',
            'contact_number': '+1-800-ORTHO-3'
        },
        {
            'name': 'Pediatrics',
            'description': 'Children healthcare',
            'contact_number': '+1-800-CHILD-4'
        },
        {
            'name': 'General Medicine',
            'description': 'General medical care and consultation',
            'contact_number': '+1-800-MEDI-5'
        },
    ]
    
    for dept_data in departments:
        dept, created = Department.objects.get_or_create(
            name=dept_data['name'],
            defaults={
                'description': dept_data['description'],
                'contact_number': dept_data['contact_number']
            }
        )
        if created:
            print(f'Created department: {dept.name}')
        else:
            print(f'Department {dept.name} already exists')

def create_demo_users():
    """Create demo users for testing"""
    # Create admin user
    admin_user, created = User.objects.get_or_create(
        email='admin@e-hospital.com',
        defaults={
            'username': 'admin',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print('Created admin user: admin@e-hospital.com (password: admin123)')
    else:
        print('Admin user already exists')
    
    # Create sample doctors
    doctors_data = [
        {'email': 'dr.smith@e-hospital.com', 'first_name': 'John', 'last_name': 'Smith'},
        {'email': 'dr.jane@e-hospital.com', 'first_name': 'Jane', 'last_name': 'Doe'},
        {'email': 'dr.wilson@e-hospital.com', 'first_name': 'Michael', 'last_name': 'Wilson'},
    ]
    
    for doc_data in doctors_data:
        doctor, created = User.objects.get_or_create(
            email=doc_data['email'],
            defaults={
                'username': doc_data['email'].split('@')[0],
                'first_name': doc_data['first_name'],
                'last_name': doc_data['last_name'],
                'role': 'doctor'
            }
        )
        if created:
            doctor.set_password('doctor123')
            doctor.save()
            print(f'Created doctor: {doctor.email} (password: doctor123)')
    
    # Create sample patients
    patients_data = [
        {'email': 'patient1@e-hospital.com', 'first_name': 'Alice', 'last_name': 'Johnson'},
        {'email': 'patient2@e-hospital.com', 'first_name': 'Bob', 'last_name': 'Brown'},
        {'email': 'patient3@e-hospital.com', 'first_name': 'Carol', 'last_name': 'Davis'},
    ]
    
    for pat_data in patients_data:
        patient, created = User.objects.get_or_create(
            email=pat_data['email'],
            defaults={
                'username': pat_data['email'].split('@')[0],
                'first_name': pat_data['first_name'],
                'last_name': pat_data['last_name'],
                'role': 'patient'
            }
        )
        if created:
            patient.set_password('patient123')
            patient.save()
            print(f'Created patient: {patient.email} (password: patient123)')

if __name__ == '__main__':
    print('Creating seed data...')
    create_departments()
    create_demo_users()
    print('Seed data creation completed!')
