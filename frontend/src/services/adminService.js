import api from './api';

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Users
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  updateUserStatus: async (id, data) => {
    const response = await api.put(`/admin/users/${id}/status`, data);
    return response.data;
  },

  // Jobs
  getAllJobs: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/admin/jobs?${params}`);
    return response.data;
  },

  // Skills
  getSkills: async () => {
    const response = await api.get('/admin/skills');
    return response.data;
  },

  createSkill: async (data) => {
    const response = await api.post('/admin/skills', data);
    return response.data;
  },

  updateSkill: async (id, data) => {
    const response = await api.put(`/admin/skills/${id}`, data);
    return response.data;
  },

  // Questions
  getQuestions: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/admin/questions?${params}`);
    return response.data;
  },

  createQuestion: async (data) => {
    const response = await api.post('/admin/questions', data);
    return response.data;
  },

  updateQuestion: async (id, data) => {
    const response = await api.put(`/admin/questions/${id}`, data);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(`/admin/questions/${id}`);
    return response.data;
  },

  // Payments
  getPayments: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/admin/payments?${params}`);
    return response.data;
  },

  // Reports
  generateReport: async (type, startDate, endDate) => {
    const response = await api.get(`/admin/reports?type=${type}&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
};