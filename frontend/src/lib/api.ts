'use client';

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class APIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

const api = new APIClient();
export default api;
