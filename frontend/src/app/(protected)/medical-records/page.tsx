'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/Button';

interface MedicalRecord {
  id: number;
  record_type: string;
  title: string;
  description: string;
  findings: string;
  recommendations: string;
  record_date: string;
  is_verified: boolean;
  doctor_name: string;
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-records/');
      setRecords(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading medical records...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Medical Records</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {records.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">No medical records found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{record.title}</h3>
                  <p className="text-sm text-gray-500">{record.record_type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  record.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-2">{record.description}</p>
              
              {record.findings && (
                <div className="mb-2">
                  <p className="font-semibold text-sm">Findings:</p>
                  <p className="text-gray-600 text-sm">{record.findings}</p>
                </div>
              )}
              
              {record.recommendations && (
                <div className="mb-2">
                  <p className="font-semibold text-sm">Recommendations:</p>
                  <p className="text-gray-600 text-sm">{record.recommendations}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Dr. {record.doctor_name}</p>
                <p className="text-sm text-gray-500">{new Date(record.record_date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
