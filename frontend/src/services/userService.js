import api from './api';

export const userService = {
  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Upload profile photo
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/users/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get user profile by ID
  getProfile: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Get applied jobs
  getAppliedJobs: async (page = 1, limit = 10) => {
    const response = await api.get(`/users/me/applications?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Update location
  updateLocation: async (locationData) => {
    const response = await api.put('/users/location', locationData);
    return response.data;
  },
};