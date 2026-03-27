import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/AppConstants';

export function setupInterceptors(httpClient) {
  // Request interceptor — attach auth token
  httpClient.interceptors.request.use(
    (config) => {
      const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — handle errors globally
  httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        return Promise.reject({ message: 'Network error. Please check your connection.' });
      }

      const { status, data } = error.response;

      if (status === 401) {
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        storage.remove(STORAGE_KEYS.USER);
        window.location.href = '/login';
        return Promise.reject({ message: 'Session expired. Please login again.' });
      }

      if (status === 403) {
        return Promise.reject({ message: 'You do not have permission to perform this action.' });
      }

      const message = data?.message || data?.error || `Request failed (${status})`;
      return Promise.reject({ message, status, data });
    }
  );
}
