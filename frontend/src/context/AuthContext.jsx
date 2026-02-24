import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (mobile) => {
    try {
      const response = await api.post('/auth/request-otp', { mobile });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (mobile, otp, name, role) => {
    try {
      const response = await api.post('/auth/verify-otp', { mobile, otp, name, role });
      const { token, user: userData, isNewUser } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      return { user: userData, isNewUser };
    } catch (error) {
      throw error.response?.data || { error: 'Verification failed' };
    }
  };

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    }
  }, [navigate]);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value = {
    user,
    loading,
    requestOTP,
    verifyOTP,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
    isSubscribed: user?.subscriptionStatus === 'active',
    isVerified: user?.isVerified,
    hasExamPassed: user?.examPassed,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};