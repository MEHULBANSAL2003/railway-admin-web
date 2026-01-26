import axios from 'axios';
import { common } from "../constants/common.js";
import { setupInterceptors } from './interceptors.js';

const TIMEOUT_VALUE = 10000;

const api = axios.create({
  timeout: TIMEOUT_VALUE,
});

const refreshClient = axios.create({
  timeout: TIMEOUT_VALUE,
});

// Setup interceptors
setupInterceptors(api, refreshClient);


// Helper function to build headers
const buildHeaders = (setHeader = false) => {
  const headers = {
    app_id: (common?.getAppId() || '').toString(),
    business_id: (common?.getBusinessId() || '').toString(),
    app_version: common.getAppVersion() || '1.0.0',
  };

  if (setHeader) {
    const token = common.getAccessToken();
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

// Remove handleError function - now handled by interceptor

export const HttpWrapper = {
  get: async (url, params = null, setHeader = false, signal = null) => {
    const headers = buildHeaders(setHeader);
    const fullUrl = appendParams(url, params);

    return await api.get(fullUrl, {
      headers,
      timeout: TIMEOUT_VALUE,
      signal,
    });
  },

  post: async (url, body, setHeader = false) => {
    const headers = buildHeaders(setHeader);
    return await api.post(url, body, { headers });
  },

  postParams: async (url, params = null, setHeader = false) => {
    const headers = buildHeaders(setHeader);

    const formData = new FormData();
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return await api.post(url, formData, { headers });
  },

  postWithQueryParams: async (url, params = null, body = null, setHeader = false) => {
    const headers = buildHeaders(setHeader);
    const fullUrl = appendParams(url, params);
    return await api.post(fullUrl, body, { headers });
  },

  delete: async (url, params = null, setHeader = false) => {
    const headers = buildHeaders(setHeader);
    const fullUrl = appendParams(url, params);
    return await api.delete(fullUrl, { headers });
  },
};
