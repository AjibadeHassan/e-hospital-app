'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Button from '@/components/Button';

interface Prescription {
  id: number;
  patient_name: string;
  doctor_name: string;
  doctor_email: string;
  medicine_details: {
    id: number;
    name: string;
    generic_name: string;
    strength: string;
    form: string;
    manufacturer: string;
  };
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  refills: number;
  refills_remaining: number;
  status: string;
  prescription_date: string;
  is_active: boolean;
  created_at: string;
}

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const prescriptionId = params.id as string;
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refilling, setRefilling] = useState(false);

  useEffect(() => {
    fetchPrescriptionDetail();
  }, [prescriptionId]);

  const fetchPrescriptionDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/prescriptions/${prescriptionId}/`);
      setPrescription(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleRefill = async () => {
    if (!prescription) return;
    try {
      setRefilling(true);
      await api.post(`/prescriptions/${prescription.id}/refill/`);
      fetchPrescriptionDetail();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to refill prescription');
    } finally {
      setRefilling(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading prescription...</div>;
  }

  if (error || !prescription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Prescription not found'}
        </div>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        ← Back to Prescriptions
      </Button>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{prescription.medicine_details.name}</h1>
              <p className="text-gray-600">Generic: {prescription.medicine_details.generic_name}</p>
              <p className="text-sm text-gray-500">Dr. {prescription.doctor_name}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                prescription.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {prescription.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Medicine Details */}
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Strength</p>
            <p className="text-lg font-semibold">{prescription.medicine_details.strength}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Form</p>
            <p className="text-lg font-semibold">{prescription.medicine_details.form}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Manufacturer</p>
            <p className="text-lg font-semibold">{prescription.medicine_details.manufacturer}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Quantity</p>
            <p className="text-lg font-semibold">{prescription.quantity}</p>
          </div>
        </div>
        
        {/* Dosage Information */}
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Dosage Instructions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Dosage</p>
              <p className="font-semibold text-lg">{prescription.dosage}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Frequency</p>
              <p className="font-semibold text-lg">{prescription.frequency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold text-lg">{prescription.duration}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prescribed Date</p>
              <p className="font-semibold text-lg">{new Date(prescription.prescription_date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Instructions</p>
            <p className="text-gray-700 leading-relaxed">{prescription.instructions}</p>
          </div>
        </div>
        
        {/* Refill Information */}
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-600 uppercase tracking-wide">Refills Remaining</p>
            <p className="text-2xl font-bold text-primary">{prescription.refills_remaining} of {prescription.refills}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 uppercase tracking-wide">Status</p>
            <p className={`text-2xl font-bold ${
              prescription.is_active ? 'text-green-600' : 'text-red-600'
            }`}>
              {prescription.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4">
          {prescription.refills_remaining > 0 && prescription.is_active && (
            <Button
              variant="primary"
              onClick={handleRefill}
              disabled={refilling}
            >
              {refilling ? 'Processing...' : 'Request Refill'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
