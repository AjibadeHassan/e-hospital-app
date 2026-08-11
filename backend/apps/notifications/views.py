from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_read', 'notification_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get notifications for current user"""
        return Notification.objects.filter(recipient=self.request.user)
    
    @extend_schema(
        description="Get unread notifications count",
    )
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)
    
    @extend_schema(
        description="Mark a notification as read",
    )
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(
            {'message': 'Notification marked as read'},
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        description="Mark all notifications as read",
    )
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        return Response(
            {'message': 'All notifications marked as read'},
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        description="Delete a notification",
    )
    @action(detail=True, methods=['delete'])
    def delete_notification(self, request, pk=None):
        """Delete a notification"""
        notification = self.get_object()
        notification.delete()
        return Response(
            {'message': 'Notification deleted'},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @extend_schema(
        description="Get notifications by type",
    )
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get notifications filtered by type"""
        notification_type = request.query_params.get('type')
        if not notification_type:
            return Response(
                {'detail': 'type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notifications = Notification.objects.filter(
            recipient=request.user,
            notification_type=notification_type
        ).order_by('-created_at')
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @extend_schema(
        description="Clear all notifications",
    )
    @action(detail=False, methods=['post'])
    def clear_all(self, request):
        """Clear all notifications for user"""
        count = Notification.objects.filter(recipient=request.user).delete()[0]
        return Response(
            {'message': f'{count} notifications deleted'},
            status=status.HTTP_200_OK
        )
