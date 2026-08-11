'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/Button';

interface MedicalRecord {
  id: number;
  patient_name: string;
  doctor_name: string;
  doctor_email: string;
  record_type: string;
  title: string;
  description: string;
  findings: string;
  recommendations: string;
  record_date: string;
  file_url: string;
  is_verified: boolean;
}

export default function MedicalRecordsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchMedicalRecords();
    }
  }, [user, router]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-records/');
      setRecords(response.data.results || response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl: string, filename: string) => {
    if (!fileUrl) {
      setError('No file available for download');
      return;
    }
    window.open(fileUrl, '_blank');
  };

  const getRecordTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'lab_test': 'bg-blue-100 text-blue-800',
      'x_ray': 'bg-purple-100 text-purple-800',
      'ultrasound': 'bg-pink-100 text-pink-800',
      'ct_scan': 'bg-orange-100 text-orange-800',
      'diagnosis': 'bg-red-100 text-red-800',
      'consultation': 'bg-green-100 text-green-800',
      'surgery': 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredRecords = filter === 'all' 
    ? records 
    : filter === 'verified'
    ? records.filter(r => r.is_verified)
    : records.filter(r => r.record_type === filter);

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
      
      {/* Filter Section */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All Records
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'verified'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Verified Only
        </button>
        <button
          onClick={() => setFilter('lab_test')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'lab_test'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Lab Tests
        </button>
        <button
          onClick={() => setFilter('diagnosis')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'diagnosis'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Diagnoses
        </button>
      </div>
      
      {filteredRecords.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">No medical records found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{record.title}</h3>
                  <p className="text-sm text-gray-600">{record.doctor_name}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    getRecordTypeColor(record.record_type)
                  }`}>
                    {record.record_type.replace('_', ' ').toUpperCase()}
                  </span>
                  {record.is_verified && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-700">
                  <span className="font-semibold">Date:</span> {new Date(record.record_date).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Description:</span> {record.description}
                </p>
                {record.findings && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Findings:</span> {record.findings}
                  </p>
                )}
                {record.recommendations && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Recommendations:</span> {record.recommendations}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/medical-records/${record.id}`)}
                >
                  View Details
                </Button>
                {record.file_url && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownload(record.file_url, record.title)}
                  >
                    Download File
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
