import axios from 'axios';
import { common } from '../constants/common.js';
import { AuthService } from '../services/AuthService.js';

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

export const setupInterceptors = (apiInstance) => {
  // Request interceptor - Add token to all requests
  apiInstance.interceptors.request.use(
    (config) => {
      const token = common.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle token expiration
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {

        if (isRefreshing) {
          // If already refreshing, queue this request
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

        const refreshToken = common.getRefreshToken();

        if (!refreshToken) {
          // No refresh token, logout user
          common.logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          // Call refresh token API
          const response = await AuthService.refreshAccessToken({
            refresh_token: refreshToken
          });

          if (response?.data?.status === 'success') {
            const newAccessToken = response.data.data.accessToken;
            const newRefreshToken = response.data.data.refreshToken;

            // Update tokens
            common.setAccessToken(newAccessToken);
            common.setRefreshToken(newRefreshToken);

            // Update original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Process queued requests
            processQueue(null, newAccessToken);

            // Retry original request
            return apiInstance(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          common.logout();
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
