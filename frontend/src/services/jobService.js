import api from './api';

export const jobService = {
  // Get jobs with filters
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const response = await api.get(`/jobs?${params}`);
    return response.data;
  },

  // Get single job
  getJob: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Get recommended jobs
  getRecommendedJobs: async () => {
    const response = await api.get('/jobs/recommended');
    return response.data;
  },

  // Create job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update job
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete job
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Apply for job
  applyForJob: async (id, coverLetter) => {
    const response = await api.post(`/jobs/${id}/apply`, { coverLetter });
    return response.data;
  },

  // Get employer's jobs
  getMyJobs: async (page = 1, limit = 10) => {
    const response = await api.get(`/jobs/my-jobs?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get job applications
  getJobApplications: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  },

  // Update application status
  updateApplicationStatus: async (applicationId, status, notes) => {
    const response = await api.put(`/jobs/applications/${applicationId}`, { status, notes });
    return response.data;
  },

  // Search candidates
  searchCandidates: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const response = await api.get(`/jobs/candidates?${params}`);
    return response.data;
  },
};