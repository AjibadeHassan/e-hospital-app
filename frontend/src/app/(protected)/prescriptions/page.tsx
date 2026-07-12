'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/Button';

interface Medication {
  id: number;
  drug_name: string;
  strength: string;
  dosage_form: string;
  frequency: string;
  duration_days: number;
  instructions: string;
  side_effects: string;
}

interface Prescription {
  id: number;
  doctor_name: string;
  issue_date: string;
  expiry_date: string;
  medications: Medication[];
  notes: string;
  is_active: boolean;
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prescriptions/');
      setPrescriptions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading prescriptions...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Prescriptions</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {prescriptions.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">No prescriptions found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Prescription from Dr. {prescription.doctor_name}</h3>
                  <p className="text-sm text-gray-500">Issued: {new Date(prescription.issue_date).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  prescription.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {prescription.is_active ? 'Active' : 'Expired'}
                </span>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Medications:</h4>
                <div className="space-y-2">
                  {prescription.medications.map((med) => (
                    <div key={med.id} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{med.drug_name} - {med.strength}</p>
                      <p className="text-sm text-gray-600">
                        {med.dosage_form} | {med.frequency} | {med.duration_days} days
                      </p>
                      {med.instructions && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">Instructions:</span> {med.instructions}
                        </p>
                      )}
                      {med.side_effects && (
                        <p className="text-sm text-red-600 mt-1">
                          <span className="font-semibold">Side effects:</span> {med.side_effects}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {prescription.notes && (
                <div className="bg-blue-50 p-3 rounded mb-4">
                  <p className="font-semibold text-sm mb-1">Notes:</p>
                  <p className="text-sm text-gray-600">{prescription.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="primary" size="sm">Download</Button>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
