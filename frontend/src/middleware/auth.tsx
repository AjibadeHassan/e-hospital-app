'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

const protectedRoutes = [
  '/dashboard',
  '/appointments',
  '/profile',
  '/medical-records',
  '/prescriptions',
  '/notifications',
];

export function AuthMiddleware({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    setIsLoading(false);

    // Check if current route requires authentication
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected && !isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
    }

    // Redirect authenticated users away from login/register
    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, pathname, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
}
