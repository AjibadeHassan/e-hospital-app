'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/Button';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">E-Hospital Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.first_name}!</span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Appointments"
            description="Manage your appointments"
            href="/appointments"
          />
          <DashboardCard
            title="Medical Records"
            description="View your medical history"
            href="/medical-records"
          />
          <DashboardCard
            title="Prescriptions"
            description="Check your prescriptions"
            href="/prescriptions"
          />
          <DashboardCard
            title="Notifications"
            description="View your notifications"
            href="/notifications"
          />
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
}

function DashboardCard({ title, description, href }: DashboardCardProps) {
  const router = useRouter();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(href)}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
