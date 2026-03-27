import { STORAGE_KEYS } from '../constants/AppConstants.js';
import { Storage } from '../utils/storage.js';
import ApiConstants from '../constants/ApiConstants.js';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (apiInstance, refreshClient) => {
  // Request interceptor — attach auth token
  apiInstance.interceptors.request.use(
    (config) => {
      const token = Storage.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — 401 refresh flow
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiInstance(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = Storage.get(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
          Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
          Storage.remove(STORAGE_KEYS.USER);
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const response = await refreshClient.post(
            ApiConstants.AUTH.REFRESH,
            { refreshToken }
          );

          if (response?.data?.status === 'success') {
            const newAccessToken = response.data.data.accessToken;
            const newRefreshToken = response.data.data.refreshToken;

            Storage.set(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
            if (newRefreshToken) {
              Storage.set(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);

            return apiInstance(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
          Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
          Storage.remove(STORAGE_KEYS.USER);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};
