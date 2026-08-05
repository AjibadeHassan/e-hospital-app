import pytest
from django.urls import reverse
from rest_framework import status
from apps.appointments.models import Appointment, Department
from django.utils import timezone
from datetime import timedelta

@pytest.mark.django_db
class TestAppointmentEndpoints:
    """Test appointment endpoints"""
    
    @pytest.fixture
    def department(self, db):
        """Create a test department"""
        return Department.objects.create(
            name='Cardiology',
            description='Heart care',
            contact_number='+1-800-HEART'
        )
    
    @pytest.fixture
    def appointment(self, db, user, doctor, department):
        """Create a test appointment"""
        future_date = timezone.now() + timedelta(days=7)
        return Appointment.objects.create(
            patient=user,
            doctor=doctor,
            department=department,
            appointment_date=future_date,
            reason='Regular checkup',
            status='scheduled'
        )
    
    def test_list_appointments(self, authenticated_client, appointment):
        """Test listing appointments"""
        url = reverse('appointment-list')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
    
    def test_create_appointment(self, authenticated_client, doctor, department):
        """Test creating an appointment"""
        url = reverse('appointment-list')
        future_date = (timezone.now() + timedelta(days=7)).isoformat()
        data = {
            'doctor': doctor.id,
            'department': department.id,
            'appointment_date': future_date,
            'reason': 'Consultation',
            'notes': 'Follow up visit'
        }
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['reason'] == 'Consultation'
    
    def test_get_appointment_detail(self, authenticated_client, appointment):
        """Test getting appointment details"""
        url = reverse('appointment-detail', kwargs={'pk': appointment.id})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == appointment.id
    
    def test_cancel_appointment(self, authenticated_client, appointment):
        """Test cancelling an appointment"""
        url = reverse('appointment-cancel', kwargs={'pk': appointment.id})
        response = authenticated_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        appointment.refresh_from_db()
        assert appointment.status == 'cancelled'
    
    def test_get_available_slots(self, authenticated_client, doctor, appointment):
        """Test getting available time slots"""
        url = reverse('appointment-available-slots')
        future_date = (timezone.now() + timedelta(days=1)).date()
        params = {
            'doctor_id': doctor.id,
            'date': str(future_date)
        }
        response = authenticated_client.get(url, params)
        assert response.status_code == status.HTTP_200_OK
        assert 'slots' in response.data
    
    def test_get_doctors_list(self, authenticated_client, doctor):
        """Test getting list of doctors"""
        url = reverse('appointment-doctors')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
    
    def test_list_departments(self, authenticated_client, department):
        """Test listing departments"""
        url = reverse('department-list')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
