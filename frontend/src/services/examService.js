import api from "./api";

export const examService = {
  getAvailableExams: () => api.get("/exams").then((r) => r.data),

  startExam: (skillId) =>
    api.get(`/exams/${skillId}/start`).then((r) => r.data),

  submitExam: (attemptId, answers) =>
    api
      .post(`/exams/attempt/${attemptId}/submit`, { answers })
      .then((r) => r.data),
      
  getExamHistory: () => api.get("/exams/history").then((r) => r.data),
};
