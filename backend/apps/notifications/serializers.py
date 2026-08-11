from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    related_object_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'recipient_name', 'notification_type', 'title', 'message',
            'related_content_type', 'related_object_id', 'related_object_url',
            'is_read', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'recipient', 'created_at', 'updated_at']
    
    def get_related_object_url(self, obj):
        """Generate URL for related object based on notification type"""
        urls = {
            'appointment': f'/appointments/{obj.related_object_id}',
            'prescription': f'/prescriptions/{obj.related_object_id}',
            'medical_record': f'/medical-records/{obj.related_object_id}',
            'message': f'/messages/{obj.related_object_id}',
        }
        return urls.get(obj.notification_type, None)
