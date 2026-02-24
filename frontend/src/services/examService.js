import api from './api';

export const examService = {
  // Get available exams
  getAvailableExams: async () => {
    const response = await api.get('/exams');
    return response.data;
  },

  // Start exam
  startExam: async (skillId) => {
    const response = await api.get(`/exams/${skillId}/start`);
    return response.data;
  },

  // Submit exam
  submitExam: async (attemptId, answers) => {
    const response = await api.post(`/exams/attempt/${attemptId}/submit`, { answers });
    return response.data;
  },

  // Get exam history
  getExamHistory: async () => {
    const response = await api.get('/exams/history');
    return response.data;
  },
};