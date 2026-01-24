import axios from 'axios';
import { common } from "../constants/common.js";

const TIMEOUT_VALUE = 10000;
const api = axios.create({
  timeout: TIMEOUT_VALUE,
});

// Helper function to build headers
const buildHeaders = (setHeader = false) => {
  const headers = {
    app_id: (common?.getAppId() || '').toString(),
    business_id: (common?.getBusinessId() || '').toString(),
    app_version: common.getAppVersion() || '1.0.0',
  };

  if (setHeader) {
    const token = common.getToken();
    let id = common.getUserData('id');

    if (typeof id !== 'string' && id !== null) {
      id = id.toString();
    }

    headers['Authorization'] = `Bearer ${token || ''}`;
    headers['id'] = id || '-1';
  }

  return headers;
};

// Helper function to append query params to URL
const appendParams = (url, params) => {
  if (!params) return url;
  const query = new URLSearchParams(params).toString();
  return `${url}?${query}`;
};

// Helper function to handle errors
const handleError = (error) => {
  if (error?.response?.status === 401) {
    console.warn('Unauthorized (401): Logging out user...');
    common.logout();
  }
  throw error;
};

export const HttpWrapper = {
  get: async (url, params = null, setHeader = false, signal = null) => {
    try {
      const headers = buildHeaders(setHeader);
      const fullUrl = appendParams(url, params);

      return await api.get(fullUrl, {
        headers,
        timeout: TIMEOUT_VALUE,
        signal,
      });
    } catch (error) {
      handleError(error);
    }
  },

  post: async (url, body, setHeader = false) => {
    try {
      const headers = buildHeaders(setHeader);
      return await api.post(url, body, { headers });
    } catch (error) {
      handleError(error);
    }
  },

  postParams: async (url, params = null, setHeader = false) => {
    try {
      const headers = buildHeaders(setHeader);

      const formData = new FormData();
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      return await api.post(url, formData, { headers });
    } catch (error) {
      handleError(error);
    }
  },

  postWithQueryParams: async (url, params = null, body = null, setHeader = false) => {
    try {
      const headers = buildHeaders(setHeader);
      const fullUrl = appendParams(url, params);
      return await api.post(fullUrl, body, { headers });
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (url, params = null, setHeader = false) => {
    try {
      const headers = buildHeaders(setHeader);
      const fullUrl = appendParams(url, params);
      return await api.delete(fullUrl, { headers });
    } catch (error) {
      handleError(error);
    }
  },
};
