from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from .serializers import UserSerializer

User = get_user_model()

class UserManagementViewSet(viewsets.ModelViewSet):
    """Admin viewset for user management"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filterset_fields = ['role', 'is_active']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    
    @extend_schema(
        description="Get user statistics",
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get user statistics"""
        total_users = User.objects.count()
        by_role = {}
        for role in ['patient', 'doctor', 'nurse', 'pharmacist', 'admin']:
            by_role[role] = User.objects.filter(role=role).count()
        
        return Response({
            'total_users': total_users,
            'by_role': by_role,
            'active_users': User.objects.filter(is_active=True).count(),
            'inactive_users': User.objects.filter(is_active=False).count(),
        }, status=status.HTTP_200_OK)
    
    @extend_schema(
        description="Activate a user",
    )
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user"""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response(
            {'message': 'User activated successfully'},
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        description="Deactivate a user",
    )
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response(
            {'message': 'User deactivated successfully'},
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        description="Reset user password",
    )
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset user password"""
        user = self.get_object()
        new_password = request.data.get('password')
        if not new_password:
            return Response(
                {'detail': 'password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(new_password)
        user.save()
        return Response(
            {'message': 'Password reset successfully'},
            status=status.HTTP_200_OK
        )
