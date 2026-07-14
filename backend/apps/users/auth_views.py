from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from drf_spectacular.utils import extend_schema
from .models import User
from .serializers import UserSerializer, LoginSerializer

@extend_schema(
    description="User login endpoint",
    request=LoginSerializer,
    responses={
        200: {'type': 'object', 'properties': {
            'token': {'type': 'string'},
            'user': {'type': 'object'},
            'message': {'type': 'string'}
        }},
        400: {'type': 'object', 'properties': {'detail': {'type': 'string'}}}
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if user.check_password(password):
            token, _ = Token.objects.get_or_create(user=user)
            user_serializer = UserSerializer(user)
            return Response({
                'token': token.key,
                'user': user_serializer.data,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'detail': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    description="User registration endpoint",
    request=UserSerializer,
    responses={
        201: {'type': 'object', 'properties': {
            'user': {'type': 'object'},
            'message': {'type': 'string'}
        }},
        400: {'type': 'object', 'properties': {'detail': {'type': 'string'}}}
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """User registration endpoint"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Check if email already exists
            if User.objects.filter(email=serializer.validated_data['email']).exists():
                return Response(
                    {'detail': 'Email already registered'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = serializer.save()
            user.set_password(serializer.validated_data['password'])
            user.save()
            
            return Response({
                'user': UserSerializer(user).data,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    description="Get current user profile",
    responses={
        200: UserSerializer,
        401: {'type': 'object', 'properties': {'detail': {'type': 'string'}}}
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    description="Update current user profile",
    request=UserSerializer,
    responses={
        200: UserSerializer,
        400: {'type': 'object', 'properties': {'detail': {'type': 'string'}}}
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Update current user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    description="User logout endpoint",
    responses={
        200: {'type': 'object', 'properties': {'message': {'type': 'string'}}}
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    request.user.auth_token.delete()
    return Response(
        {'message': 'Logged out successfully'},
        status=status.HTTP_200_OK
    )
