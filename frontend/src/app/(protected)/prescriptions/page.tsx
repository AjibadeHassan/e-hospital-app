'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/Button';

interface Prescription {
  id: number;
  patient_name: string;
  doctor_name: string;
  doctor_email: string;
  medicine_details: {
    name: string;
    strength: string;
    form: string;
  };
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  refills_remaining: number;
  status: string;
  prescription_date: string;
  is_active: boolean;
}

export default function PrescriptionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active');
  const [refilling, setRefilling] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchPrescriptions();
    }
  }, [user, router]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prescriptions/');
      setPrescriptions(response.data.results || response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefill = async (id: number) => {
    try {
      setRefilling(id);
      await api.post(`/prescriptions/${id}/refill/`);
      fetchPrescriptions();
      setError(''); // Clear any previous errors
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to refill prescription');
    } finally {
      setRefilling(null);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      await api.get(`/prescriptions/${id}/download/`);
      // PDF download logic to be implemented
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to download prescription');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-blue-100 text-blue-800',
      'dispensed': 'bg-green-100 text-green-800',
      'refilled': 'bg-purple-100 text-purple-800',
      'expired': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredPrescriptions = filter === 'active'
    ? prescriptions.filter(p => p.is_active)
    : filter === 'dispensed'
    ? prescriptions.filter(p => p.status === 'dispensed')
    : prescriptions;

  if (loading) {
    return <div className="text-center py-8">Loading prescriptions...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Prescriptions</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Filter Section */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'active'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('dispensed')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'dispensed'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Dispensed
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All
        </button>
      </div>
      
      {filteredPrescriptions.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">No prescriptions found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{prescription.medicine_details.name}</h3>
                  <p className="text-sm text-gray-600">Prescribed by Dr. {prescription.doctor_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  getStatusColor(prescription.status)
                }`}>
                  {prescription.status.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-600">Strength</p>
                  <p className="font-semibold">{prescription.medicine_details.strength}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Form</p>
                  <p className="font-semibold">{prescription.medicine_details.form}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dosage</p>
                  <p className="font-semibold">{prescription.dosage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Frequency</p>
                  <p className="font-semibold">{prescription.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold">{prescription.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Refills</p>
                  <p className="font-semibold">{prescription.refills_remaining}/{prescription.refills}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Instructions</p>
                <p className="text-gray-700">{prescription.instructions}</p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(`/prescriptions/${prescription.id}`)}
                >
                  View Details
                </Button>
                {prescription.refills_remaining > 0 && prescription.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefill(prescription.id)}
                    disabled={refilling === prescription.id}
                  >
                    {refilling === prescription.id ? 'Refilling...' : 'Request Refill'}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(prescription.id)}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
