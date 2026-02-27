import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

// Backend returns both snake_case (DB) and camelCase (auth response)
// Normalize both to consistent camelCase for all components
export const normalizeUser = (raw) => {
  if (!raw) return null;
  return {
    id: raw.id,
    mobile: raw.mobile,
    name: raw.name,
    email: raw.email ?? null,
    role: raw.role,
    area: raw.area ?? null,
    city: raw.city ?? null,
    state: raw.state ?? null,
    pincode: raw.pincode ?? null,
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    bio: raw.bio ?? null,
    availability: raw.availability ?? null,
    experienceYears: raw.experienceYears ?? raw.experience_years ?? null,
    expectedSalaryMin: raw.expectedSalaryMin ?? raw.expected_salary_min ?? null,
    expectedSalaryMax: raw.expectedSalaryMax ?? raw.expected_salary_max ?? null,
    isVerified: raw.isVerified ?? raw.is_verified ?? false,
    examPassed: raw.examPassed ?? raw.exam_passed ?? false,
    subscriptionStatus:
      raw.subscriptionStatus ?? raw.subscription_status ?? "free",
    subscriptionEndDate:
      raw.subscriptionEndDate ?? raw.subscription_end_date ?? null,
    profileCompleted: raw.profileCompleted ?? raw.profile_completed ?? false,
    isActive: raw.isActive ?? raw.is_active ?? true,
    skills: raw.skills ?? [],
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await api.get("/auth/me");
      setUser(normalizeUser(response.data));
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (mobile) => {
    try {
      const response = await api.post("/auth/request-otp", { mobile });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to send OTP" };
    }
  };

  const verifyOTP = async (mobile, otp, name, role) => {
    try {
      const response = await api.post("/auth/verify-otp", {
        mobile,
        otp,
        name,
        role,
      });
      localStorage.setItem("token", response.data.token);

      // Fetch full user data — verify-otp returns partial data only
      const meResponse = await api.get("/auth/me");
      const fullUser = normalizeUser(meResponse.data);
      setUser(fullUser);
      setLoading(false);

      return { ...response.data, user: fullUser };
    } catch (error) {
      throw error.response?.data || { error: "Verification failed" };
    }
  };

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
      toast.success("Logged out successfully");
    }
  }, [navigate]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => normalizeUser({ ...prev, ...updates }));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      const normalized = normalizeUser(response.data);
      setUser(normalized);
      return normalized;
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        requestOTP,
        verifyOTP,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated: !!user,
        isSubscribed: user?.subscriptionStatus === "active",
        isVerified: !!user?.isVerified,
        hasExamPassed: !!user?.examPassed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
