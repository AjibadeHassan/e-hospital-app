'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  bio?: string;
  phone_number?: string;
  profile_picture?: string;
  is_active: boolean;
  created_at: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  login: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      
      setToken: (token: string) => {
        set({ token });
        localStorage.setItem('auth_token', token);
      },
      
      login: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      },
      
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...userData };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },
    }),
    {
      name: 'auth-store',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    }
  )
);
