import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestAuthenticationEndpoints:
    """Test authentication endpoints"""
    
    def test_user_registration(self, api_client):
        """Test user registration endpoint"""
        url = reverse('register')
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'securepass123',
            'first_name': 'John',
            'last_name': 'Doe',
            'role': 'patient'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['user']['email'] == 'newuser@example.com'
    
    def test_user_registration_duplicate_email(self, api_client, user):
        """Test registration with duplicate email"""
        url = reverse('register')
        data = {
            'email': user.email,  # Existing email
            'username': 'different',
            'password': 'pass123',
            'first_name': 'John',
            'last_name': 'Doe',
            'role': 'patient'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_user_login(self, api_client, user):
        """Test user login endpoint"""
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'token' in response.data
        assert response.data['user']['email'] == user.email
    
    def test_user_login_wrong_password(self, api_client, user):
        """Test login with wrong password"""
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_user_profile(self, authenticated_client, user):
        """Test getting user profile"""
        url = reverse('profile')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email
    
    def test_user_profile_unauthorized(self, api_client):
        """Test accessing profile without authentication"""
        url = reverse('profile')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_update_profile(self, authenticated_client, user):
        """Test updating user profile"""
        url = reverse('update-profile')
        data = {
            'first_name': 'Updated',
            'bio': 'Updated bio'
        }
        response = authenticated_client.put(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == 'Updated'
    
    def test_user_logout(self, authenticated_client):
        """Test user logout"""
        url = reverse('logout')
        response = authenticated_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'message' in response.data
