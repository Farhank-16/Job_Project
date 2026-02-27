import api from "./api";

const toParams = (filters) => new URLSearchParams(filters);

export const adminService = {
  getDashboardStats: () => api.get("/admin/dashboard").then((r) => r.data),

  getUsers: (f = {}) =>
    api.get(`/admin/users?${toParams(f)}`).then((r) => r.data),

  updateUserStatus: (id, data) =>
    api.put(`/admin/users/${id}/status`, data).then((r) => r.data),

  getAllJobs: (f = {}) =>
    api.get(`/admin/jobs?${toParams(f)}`).then((r) => r.data),

  getSkills: () => api.get("/admin/skills").then((r) => r.data),

  createSkill: (data) => api.post("/admin/skills", data).then((r) => r.data),

  updateSkill: (id, data) =>
    api.put(`/admin/skills/${id}`, data).then((r) => r.data),

  getQuestions: (f = {}) =>
    api.get(`/admin/questions?${toParams(f)}`).then((r) => r.data),

  createQuestion: (data) =>
    api.post("/admin/questions", data).then((r) => r.data),

  updateQuestion: (id, data) =>
    api.put(`/admin/questions/${id}`, data).then((r) => r.data),
  
  deleteQuestion: (id) =>
    api.delete(`/admin/questions/${id}`).then((r) => r.data),

  getPayments: (f = {}) =>
    api.get(`/admin/payments?${toParams(f)}`).then((r) => r.data),
  
  generateReport: (type, startDate, endDate) =>
    api
      .get(
        `/admin/reports?type=${type}&startDate=${startDate}&endDate=${endDate}`,
      )
      .then((r) => r.data),
};
