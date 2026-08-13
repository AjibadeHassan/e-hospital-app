from django.contrib import admin
from django.utils.html import format_html
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'role_badge', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Authentication', {
            'fields': ('email', 'username', 'password')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'bio', 'phone_number', 'profile_picture')
        }),
        ('Role & Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def role_badge(self, obj):
        colors = {
            'patient': '#17a2b8',
            'doctor': '#28a745',
            'nurse': '#007bff',
            'pharmacist': '#ffc107',
            'admin': '#dc3545',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            colors.get(obj.role, '#6c757d'),
            obj.get_role_display() if hasattr(obj, 'get_role_display') else obj.role.upper()
        )
    role_badge.short_description = 'Role'
