import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401 && !url.includes("/auth/") && !isLoggingOut) {
      isLoggingOut = true;
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login")
        window.location.href = "/login";
      setTimeout(() => {
        isLoggingOut = false;
      }, 2000);
    } else if (
      status === 403 &&
      error.response?.data?.code === "SUBSCRIPTION_REQUIRED"
    ) {
      toast.error("Please subscribe to access this feature");
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  },
);

export default api;
