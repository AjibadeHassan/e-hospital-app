'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Button from '@/components/Button';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/users/logout/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
      router.push('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          E-Hospital
        </Link>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary">
                Dashboard
              </Link>
              <Link href="/appointments" className="text-gray-600 hover:text-primary">
                Appointments
              </Link>
              <Link href="/medical-records" className="text-gray-600 hover:text-primary">
                Records
              </Link>
              <Link href="/notifications" className="text-gray-600 hover:text-primary">
                Notifications
              </Link>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {user.first_name?.[0] || user.username?.[0]}
                </div>
                <span className="hidden md:inline text-sm">{user.first_name || user.username}</span>
              </button>
              
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-red-700 hover:bg-red-50 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Register
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
