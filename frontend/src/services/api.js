import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isLoggingOut = false;

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE OK:', response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url || '';

    console.error('❌ RESPONSE ERROR:', url, 'Status:', status,
      'Token in storage:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING',
      'Response:', error.response?.data);

    if (status === 401) {
      const isAuthRoute = url.includes('/auth/');

      console.warn('401 detected | isAuthRoute:', isAuthRoute, '| isLoggingOut:', isLoggingOut);

      if (!isAuthRoute && !isLoggingOut) {
        isLoggingOut = true;
        console.error('🚨 TRIGGERING LOGOUT — URL:', url);
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        setTimeout(() => { isLoggingOut = false; }, 2000);
      }
    } else if (status === 403) {
      if (error.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
        toast.error('Please subscribe to access this feature');
      }
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;