import api from "./api";

export const skillService = {
  getSkills: (category) =>
    api
      .get(`/skills${category ? `?category=${category}` : ""}`)
      .then((r) => r.data),

  getCategories: () => api.get("/skills/categories").then((r) => r.data),
};
