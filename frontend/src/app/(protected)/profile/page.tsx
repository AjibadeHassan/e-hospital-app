'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone_number: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        phone_number: user.phone_number || '',
      });
      setLoading(false);
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const response = await api.put('/users/profile/update/', formData);
      setUser(response.data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
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
        <div className="mb-6 pb-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Username</label>
              <p className="text-gray-700">{user?.username}</p>
            </div>
            <div>
              <label className="form-label">Email</label>
              <p className="text-gray-700">{user?.email}</p>
            </div>
            <div>
              <label className="form-label">Role</label>
              <p className="text-gray-700 capitalize">{user?.role}</p>
            </div>
            <div>
              <label className="form-label">Member Since</label>
              <p className="text-gray-700">{new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter first name"
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </div>
          
          <Input
            label="Phone Number"
            name="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Enter phone number"
            className="mb-4"
          />
          
          <div className="mb-4">
            <label className="form-label">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="form-input min-h-[120px]"
              rows={5}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
