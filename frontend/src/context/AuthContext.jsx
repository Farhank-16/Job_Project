import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// FIX: Backend returns snake_case fields, frontend expects camelCase.
// This mapper converts the raw DB/API response to consistent camelCase
// so all components can use user.profileCompleted, user.subscriptionStatus etc.
const normalizeUser = (raw) => {
  if (!raw) return null;
  return {
    id:                  raw.id,
    mobile:              raw.mobile,
    name:                raw.name,
    email:               raw.email,
    role:                raw.role,

    // snake_case → camelCase
    profilePhoto:        raw.profilePhoto        ?? raw.profile_photo        ?? null,
    area:                raw.area                ?? null,
    city:                raw.city                ?? null,
    state:               raw.state               ?? null,
    pincode:             raw.pincode             ?? null,
    latitude:            raw.latitude            ?? null,
    longitude:           raw.longitude           ?? null,
    bio:                 raw.bio                 ?? null,
    experienceYears:     raw.experienceYears     ?? raw.experience_years     ?? null,
    availability:        raw.availability        ?? null,
    expectedSalaryMin:   raw.expectedSalaryMin   ?? raw.expected_salary_min  ?? null,
    expectedSalaryMax:   raw.expectedSalaryMax   ?? raw.expected_salary_max  ?? null,
    isVerified:          raw.isVerified          ?? raw.is_verified          ?? false,
    examPassed:          raw.examPassed          ?? raw.exam_passed          ?? false,
    subscriptionStatus:  raw.subscriptionStatus  ?? raw.subscription_status  ?? 'free',
    subscriptionEndDate: raw.subscriptionEndDate ?? raw.subscription_end_date ?? null,
    profileCompleted:    raw.profileCompleted     ?? raw.profile_completed    ?? false,
    isActive:            raw.isActive            ?? raw.is_active            ?? true,
    skills:              raw.skills              ?? [],
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();
  const skipNextCheckAuth     = useRef(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (skipNextCheckAuth.current) {
      skipNextCheckAuth.current = false;
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      setUser(normalizeUser(response.data));
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        setUser(null);
      }
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
      const { token, user: userData } = response.data;

      skipNextCheckAuth.current = true;
      localStorage.setItem('token', token);
      setUser(normalizeUser(userData));
      setLoading(false);

      return response.data;
    } catch (error) {
      skipNextCheckAuth.current = false;
      throw error.response?.data || { error: 'Verification failed' };
    }
  };

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Always proceed
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    }
  }, [navigate]);

  const updateUser = useCallback((updates) => {
    setUser(prev => normalizeUser({ ...prev, ...updates }));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      const normalized = normalizeUser(response.data);
      setUser(normalized);
      return normalized;
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
    isAuthenticated:  !!user,
    isSubscribed:     user?.subscriptionStatus === 'active',
    isVerified:       !!user?.isVerified,
    hasExamPassed:    !!user?.examPassed,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};