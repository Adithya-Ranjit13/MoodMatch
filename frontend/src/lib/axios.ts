import axios from "axios";
import { getToken, saveToken, getRefreshToken, saveRefreshToken, removeToken, removeRefreshToken } from "./token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        removeToken();
        removeRefreshToken();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Get new access token
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          { refreshToken }
        );

        const newToken = res.data.token;
        const newRefreshToken = res.data.refreshToken;

        saveToken(newToken);
        saveRefreshToken(newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        removeToken();
        removeRefreshToken();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;