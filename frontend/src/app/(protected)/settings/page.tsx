'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth';

interface NotificationPreference {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  appointment_reminder: boolean;
  prescription_ready: boolean;
  medical_record_update: boolean;
  system_alerts: boolean;
  reminder_hours_before: number;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [preferences, setPreferences] = useState<NotificationPreference>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    appointment_reminder: true,
    prescription_ready: true,
    medical_record_update: true,
    system_alerts: true,
    reminder_hours_before: 24,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notification-preferences/');
      setPreferences(response.data);
    } catch (err) {
      console.error('Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreference) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/notification-preferences/', preferences);
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.includes('success')
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-medium">Email Notifications</label>
            <input
              type="checkbox"
              checked={preferences.email_notifications}
              onChange={() => handleToggle('email_notifications')}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="font-medium">Push Notifications</label>
            <input
              type="checkbox"
              checked={preferences.push_notifications}
              onChange={() => handleToggle('push_notifications')}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="font-medium">SMS Notifications</label>
            <input
              type="checkbox"
              checked={preferences.sms_notifications}
              onChange={() => handleToggle('sms_notifications')}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          
          <hr className="my-4" />
          
          <h3 className="font-semibold text-lg mt-6 mb-4">Notification Types</h3>
          
          <div className="flex items-center justify-between">
            <label className="font-medium">Appointment Reminders</label>
            <input
              type="checkbox"
              checked={preferences.appointment_reminder}
              onChange={() => handleToggle('appointment_reminder')}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="font-medium">Prescription Ready Alerts</label>
            <input
              type="checkbox"
              checked={preferences.prescription_ready}
              onChange={() => handleToggle('prescription_ready')}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="font-medium">Medical Record Updates</label>
            <input
              type="checkbox"
              checked={preferences.medical_record_update}
              onChange={() => handleToggle('medical_record_update')}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="font-medium">System Alerts</label>
            <input
              type="checkbox"
              checked={preferences.system_alerts}
              onChange={() => handleToggle('system_alerts')}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          
          <hr className="my-4" />
          
          <div>
            <label className="form-label">Appointment Reminder (hours before)</label>
            <input
              type="number"
              min="1"
              value={preferences.reminder_hours_before}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                reminder_hours_before: parseInt(e.target.value),
              }))}
              className="form-input"
            />
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
