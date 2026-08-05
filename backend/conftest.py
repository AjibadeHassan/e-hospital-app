import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

User = get_user_model()

@pytest.fixture
def api_client():
    """Fixture for API client"""
    return APIClient()

@pytest.fixture
def user(db):
    """Fixture for creating a test user"""
    user = User.objects.create_user(
        email='test@example.com',
        username='testuser',
        password='testpass123',
        first_name='Test',
        last_name='User',
        role='patient'
    )
    return user

@pytest.fixture
def doctor(db):
    """Fixture for creating a test doctor"""
    doctor = User.objects.create_user(
        email='doctor@example.com',
        username='doctoruser',
        password='doctorpass123',
        first_name='Dr',
        last_name='Smith',
        role='doctor'
    )
    return doctor

@pytest.fixture
def authenticated_user(user):
    """Fixture for authenticated user with token"""
    token, _ = Token.objects.get_or_create(user=user)
    return user, token

@pytest.fixture
def authenticated_client(api_client, authenticated_user):
    """Fixture for API client with authentication"""
    user, token = authenticated_user
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return api_client
