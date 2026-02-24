import api from './api';

export const skillService = {
  // Get all skills
  getSkills: async (category) => {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`/skills${params}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/skills/categories');
    return response.data;
  },
};