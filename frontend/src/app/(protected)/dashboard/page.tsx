'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/Button';

interface DashboardStats {
  total_appointments: number;
  upcoming_appointments: number;
  total_prescriptions: number;
  active_prescriptions: number;
  total_medical_records: number;
  unread_notifications: number;
}

interface AppointmentPreview {
  id: number;
  appointment_date: string;
  doctor_name: string;
  reason: string;
  status: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'patient') {
      router.push('/doctor-dashboard');
    } else {
      fetchDashboardData();
    }
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, prescriptionsRes, recordsRes, notificationsRes] = await Promise.all([
        api.get('/appointments/'),
        api.get('/prescriptions/'),
        api.get('/medical-records/'),
        api.get('/notifications/unread_count/'),
      ]);

      const appointments = appointmentsRes.data.results || appointmentsRes.data;
      const prescriptions = prescriptionsRes.data.results || prescriptionsRes.data;
      const records = recordsRes.data.results || recordsRes.data;
      const unreadCount = notificationsRes.data.unread_count;

      setStats({
        total_appointments: appointments.length,
        upcoming_appointments: appointments.filter((a: any) => a.status === 'scheduled').length,
        total_prescriptions: prescriptions.length,
        active_prescriptions: prescriptions.filter((p: any) => p.is_active).length,
        total_medical_records: records.length,
        unread_notifications: unreadCount,
      });

      const upcoming = appointments
        .filter((a: any) => a.status === 'scheduled')
        .sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
        .slice(0, 5);
      setUpcomingAppointments(upcoming);
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
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.first_name}!</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm uppercase tracking-wide">Total Appointments</p>
            <p className="text-3xl font-bold text-primary mt-2">{stats.total_appointments}</p>
            <p className="text-gray-500 text-sm mt-2">{stats.upcoming_appointments} upcoming</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm uppercase tracking-wide">Prescriptions</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.total_prescriptions}</p>
            <p className="text-gray-500 text-sm mt-2">{stats.active_prescriptions} active</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm uppercase tracking-wide">Medical Records</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_medical_records}</p>
            <p className="text-gray-500 text-sm mt-2">Total on file</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm uppercase tracking-wide">Notifications</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.unread_notifications}</p>
            <p className="text-gray-500 text-sm mt-2">Unread messages</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="primary"
            onClick={() => router.push('/appointments/book')}
            className="w-full"
          >
            Book Appointment
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/appointments')}
            className="w-full"
          >
            View Appointments
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/prescriptions')}
            className="w-full"
          >
            View Prescriptions
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/medical-records')}
            className="w-full"
          >
            Medical Records
          </Button>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-600">No upcoming appointments</p>
            <Button
              variant="primary"
              onClick={() => router.push('/appointments/book')}
              className="mt-4"
            >
              Book an Appointment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">Dr. {appointment.doctor_name}</h3>
                    <p className="text-gray-600">{appointment.reason}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(appointment.appointment_date).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/appointments/${appointment.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
