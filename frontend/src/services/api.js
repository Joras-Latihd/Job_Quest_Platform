import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Every service call resolves to the API envelope: { success, message, data, pagination? }.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    // An expired/invalid token on a protected call logs the user out; ProtectedRoute then redirects to /login.
    if (status === 401 && useAuthStore.getState().token) useAuthStore.getState().logout();
    const apiError = new Error(
      error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : 'Unable to reach the server. Please try again.'),
    );
    apiError.status = status;
    apiError.errors = error.response?.data?.errors || [];
    return Promise.reject(apiError);
  },
);

export default api;
