'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth';

interface Appointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  doctor_email: string;
  department_name: string;
  appointment_date: string;
  reason: string;
  status: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchAppointments();
    }
  }, [user, router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/');
      setAppointments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      setCancellingId(id);
      await api.post(`/appointments/${id}/cancel/`);
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, status: 'cancelled' } : apt
      ));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading appointments...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <Button variant="primary" onClick={() => router.push('/appointments/book')}>
          Book New Appointment
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {appointments.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">You have no appointments yet</p>
          <Button variant="primary" onClick={() => router.push('/appointments/book')}>
            Book Your First Appointment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Dr. {appointment.doctor_name}</h3>
                  <p className="text-sm text-gray-600">{appointment.department_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                  getStatusColor(appointment.status)
                }`}>
                  {appointment.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-700">
                  <span className="font-semibold">Date & Time:</span> {new Date(appointment.appointment_date).toLocaleString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Reason:</span> {appointment.reason}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Doctor Email:</span> {appointment.doctor_email}
                </p>
              </div>
              
              <div className="flex gap-2">
                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/appointments/${appointment.id}/reschedule`)}>
                      Reschedule
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCancel(appointment.id)}
                      disabled={cancellingId === appointment.id}
                    >
                      {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
