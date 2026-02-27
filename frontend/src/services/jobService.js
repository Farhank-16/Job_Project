import api from "./api";

// Skip empty/null/undefined values from query params
const toParams = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.append(k, v);
  });
  return params;
};

export const jobService = {
  getJobs: (f = {}) => api.get(`/jobs?${toParams(f)}`).then((r) => r.data),

  getJob: (id) => api.get(`/jobs/${id}`).then((r) => r.data),

  getRecommendedJobs: () => api.get("/jobs/recommended").then((r) => r.data),

  createJob: (data) => api.post("/jobs", data).then((r) => r.data),

  updateJob: (id, data) => api.put(`/jobs/${id}`, data).then((r) => r.data),

  deleteJob: (id) => api.delete(`/jobs/${id}`).then((r) => r.data),

  applyForJob: (id, coverLetter) =>
    api.post(`/jobs/${id}/apply`, { coverLetter }).then((r) => r.data),

  getMyJobs: (page = 1, limit = 10) =>
    api.get(`/jobs/my-jobs?page=${page}&limit=${limit}`).then((r) => r.data),

  getJobApplications: (jobId) =>
    api.get(`/jobs/${jobId}/applications`).then((r) => r.data),

  updateApplicationStatus: (id, status, notes) =>
    api.put(`/jobs/applications/${id}`, { status, notes }).then((r) => r.data),
  
  searchCandidates: (f = {}) =>
    api.get(`/jobs/candidates?${toParams(f)}`).then((r) => r.data),
};
