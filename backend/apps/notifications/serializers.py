from rest_framework import serializers
from .models import Notification, NotificationPreference

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'related_object_id',
                  'related_object_type', 'is_read', 'read_at', 'created_at']
        read_only_fields = ['created_at']

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['id', 'email_notifications', 'push_notifications', 'sms_notifications',
                  'appointment_reminder', 'prescription_ready', 'medical_record_update',
                  'system_alerts', 'reminder_hours_before', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
