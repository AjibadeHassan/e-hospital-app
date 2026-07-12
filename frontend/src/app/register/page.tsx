'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import Button from '@/components/Button';
import Input from '@/components/Input';

const registerSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirm: z.string(),
  role: z.enum(['patient', 'doctor', 'nurse'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');
    try {
      const { password_confirm, ...userData } = data;
      await api.post('/users/register/', userData);
      router.push('/login?message=Registration successful. Please login.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="First name"
              {...register('first_name')}
              error={errors.first_name?.message}
            />
            <Input
              label="Last Name"
              placeholder="Last name"
              {...register('last_name')}
              error={errors.last_name?.message}
            />
          </div>
          
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            error={errors.email?.message}
          />
          
          <Input
            label="Username"
            placeholder="Choose a username"
            {...register('username')}
            error={errors.username?.message}
          />
          
          <div>
            <label className="form-label">Role</label>
            <select
              {...register('role')}
              className="form-input"
            >
              <option value="">Select a role</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
            </select>
            {errors.role && <span className="text-red-500 text-sm">{errors.role.message}</span>}
          </div>
          
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            error={errors.password?.message}
          />
          
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            {...register('password_confirm')}
            error={errors.password_confirm?.message}
          />
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
