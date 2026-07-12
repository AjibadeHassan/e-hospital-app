'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth';

interface Appointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  reason: string;
  status: string;
}

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  if (loading) {
    return <div className="text-center py-8">Loading appointments...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Appointments</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {appointments.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">No appointments found</p>
          <Button variant="primary" className="mt-4">
            Book an Appointment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{appointment.doctor_name}</h3>
                  <p className="text-gray-600">{appointment.reason}</p>
                  <p className="text-sm text-gray-500">{new Date(appointment.appointment_date).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
