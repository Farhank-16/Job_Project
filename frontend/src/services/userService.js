import api from "./api";

export const userService = {
  updateProfile: (data) => api.put("/users/profile", data).then((r) => r.data),

  getProfile: (id) => api.get(`/users/${id}`).then((r) => r.data),

  getAppliedJobs: (page = 1, limit = 10) =>
    api
      .get(`/users/me/applications?page=${page}&limit=${limit}`)
      .then((r) => r.data),
      
  updateLocation: (data) =>
    api.put("/users/location", data).then((r) => r.data),
};
