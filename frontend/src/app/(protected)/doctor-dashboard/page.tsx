'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/Button';

interface DoctorStats {
  total_patients: number;
  total_appointments: number;
  appointments_today: number;
  pending_appointments: number;
  total_records_created: number;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'doctor') {
      router.push('/dashboard');
    } else {
      fetchDoctorDashboardData();
    }
  }, [user, router]);

  const fetchDoctorDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch appointments for the doctor
      const appointmentsRes = await api.get('/appointments/');
      const appointments = appointmentsRes.data.results || appointmentsRes.data;

      const today = new Date().toDateString();
      const appointmentsToday = appointments.filter((a: any) => 
        new Date(a.appointment_date).toDateString() === today
      ).length;

      setStats({
        total_patients: appointments.length > 0 ? new Set(appointments.map((a: any) => a.patient)).size : 0,
        total_appointments: appointments.length,
        appointments_today: appointmentsToday,
        pending_appointments: appointments.filter((a: any) => a.status === 'scheduled').length,
        total_records_created: 0, // TODO: Fetch from medical records
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, Dr. {user?.last_name}!</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm uppercase tracking-wide">Total Patients</p>
            <p className="text-3xl font-bold text-primary mt-2">{stats.total_patients}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm uppercase tracking-wide">Total Appointments</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_appointments}</p>
            <p className="text-gray-500 text-sm mt-2">{stats.pending_appointments} pending</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm uppercase tracking-wide">Today's Appointments</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.appointments_today}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm uppercase tracking-wide">Records Created</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.total_records_created}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={() => router.push('/appointments')}
            className="w-full"
          >
            View Appointments
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/patients')}
            className="w-full"
          >
            My Patients
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/medical-records/create')}
            className="w-full"
          >
            Create Record
          </Button>
        </div>
      </div>
    </div>
  );
}
