import axios from 'axios';
import { appConfig } from '../config/app.config';

const { baseUrl: API_BASE_URL, timeout: API_TIMEOUT } = appConfig.api;

console.log('API Base URL:', API_BASE_URL);
console.log('Environment variable:', process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.baseURL + config.url);
    const { tokenKey } = appConfig.auth;
    const token = localStorage.getItem(tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshTokenKey, tokenKey, redirectUrl } = appConfig.auth;
        
        const refreshToken = localStorage.getItem(refreshTokenKey);
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem(tokenKey, accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        const { tokenKey, refreshTokenKey, redirectUrl } = appConfig.auth;
        
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(refreshTokenKey);
        window.location.href = redirectUrl;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
