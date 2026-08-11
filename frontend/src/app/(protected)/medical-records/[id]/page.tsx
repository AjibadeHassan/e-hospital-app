'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
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
  created_at: string;
}

export default function MedicalRecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecordDetail();
  }, [recordId]);

  const fetchRecordDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/medical-records/${recordId}/`);
      setRecord(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch record');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading record...</div>;
  }

  if (error || !record) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Record not found'}
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
        ← Back to Records
      </Button>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{record.title}</h1>
              <p className="text-gray-600">Dr. {record.doctor_name}</p>
              <p className="text-sm text-gray-500">{record.doctor_email}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 mb-2">
                {record.record_type.replace('_', ' ').toUpperCase()}
              </span>
              {record.is_verified && (
                <div className="text-green-600 font-semibold">✓ Verified</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Key Information */}
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Record Date</p>
            <p className="text-lg font-semibold">{new Date(record.record_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Patient</p>
            <p className="text-lg font-semibold">{record.patient_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Created</p>
            <p className="text-lg font-semibold">{new Date(record.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Status</p>
            <p className="text-lg font-semibold">{record.is_verified ? 'Verified' : 'Pending'}</p>
          </div>
        </div>
        
        {/* Content Sections */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{record.description}</p>
          </div>
          
          {record.findings && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Findings</h2>
              <p className="text-gray-700 leading-relaxed">{record.findings}</p>
            </div>
          )}
          
          {record.recommendations && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Recommendations</h2>
              <p className="text-gray-700 leading-relaxed">{record.recommendations}</p>
            </div>
          )}
          
          {record.file_url && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">Attached File</p>
              <Button
                variant="primary"
                onClick={() => window.open(record.file_url, '_blank')}
              >
                Download Attachment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
