'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/Button';
import Input from '@/components/Input';

const appointmentSchema = z.object({
  doctor: z.string().min(1, 'Please select a doctor'),
  department: z.string().min(1, 'Please select a department'),
  appointment_date: z.string().min(1, 'Please select a date and time'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchDoctorsAndDepartments();
    }
  }, [user, router]);

  const fetchDoctorsAndDepartments = async () => {
    try {
      setLoading(true);
      const [doctorsRes, departmentsRes] = await Promise.all([
        api.get('/appointments/doctors/'),
        api.get('/departments/'),
      ]);
      setDoctors(doctorsRes.data);
      setDepartments(departmentsRes.data);
    } catch (err) {
      setError('Failed to load doctors and departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    
    if (date && selectedDoctor) {
      await fetchAvailableSlots(selectedDoctor, date);
    }
  };

  const handleDoctorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorId = e.target.value;
    setSelectedDoctor(doctorId);
    
    if (doctorId && selectedDate) {
      await fetchAvailableSlots(doctorId, selectedDate);
    }
  };

  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    try {
      const response = await api.get('/appointments/available_slots/', {
        params: {
          doctor_id: doctorId,
          date: date,
        },
      });
      setSlots(response.data.slots || []);
    } catch (err) {
      setError('Failed to fetch available slots');
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    setSubmitting(true);
    setError('');
    
    try {
      await api.post('/appointments/', data);
      router.push('/appointments?message=Appointment booked successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Department</label>
            <select
              {...register('department')}
              className="form-input"
            >
              <option value="">Select a department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department && <span className="text-red-500 text-sm">{errors.department.message}</span>}
          </div>
          
          <div>
            <label className="form-label">Doctor</label>
            <select
              {...register('doctor')}
              onChange={handleDoctorChange}
              className="form-input"
            >
              <option value="">Select a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
            {errors.doctor && <span className="text-red-500 text-sm">{errors.doctor.message}</span>}
          </div>
          
          <Input
            label="Appointment Date"
            type="date"
            {...register('appointment_date')}
            error={errors.appointment_date?.message}
            onChange={handleDateChange}
          />
          
          {slots.length > 0 && (
            <div>
              <label className="form-label">Select Time</label>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot, idx) => (
                  <label key={idx} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      {...register('appointment_date')}
                      value={slot.time}
                      className="mr-2"
                    />
                    <span className="text-sm">{slot.time}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          <Input
            label="Reason for Visit"
            placeholder="Describe your symptoms or reason for appointment"
            {...register('reason')}
            error={errors.reason?.message}
          />
          
          <div>
            <label className="form-label">Additional Notes</label>
            <textarea
              {...register('notes')}
              placeholder="Any additional information"
              className="form-input min-h-[100px]"
              rows={4}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Booking...' : 'Book Appointment'}
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
