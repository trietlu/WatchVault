import axios from 'axios';
import { appConfig } from './config';
import { useAuthStore } from '../stores/useAuthStore';

const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
