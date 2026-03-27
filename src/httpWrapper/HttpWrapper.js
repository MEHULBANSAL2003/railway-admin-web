import axios from 'axios';
import { STORAGE_KEYS } from '../constants/AppConstants.js';
import { Storage } from '../utils/storage.js';
import { setupInterceptors } from './interceptors.js';

const TIMEOUT_VALUE = 30000;

const api = axios.create({
  timeout: TIMEOUT_VALUE,
});

const refreshClient = axios.create({
  timeout: TIMEOUT_VALUE,
});

// Setup interceptors (401 → refresh queue)
setupInterceptors(api, refreshClient);

const buildHeaders = (setHeader = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (setHeader) {
    const token = Storage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const appendParams = (url, params) => {
  if (!params) return url;
  const query = new URLSearchParams(params).toString();
  return `${url}?${query}`;
};

export const HttpWrapper = {
  get: async (url, params = null, setHeader = false, signal = null) => {
    const headers = buildHeaders(setHeader);
    const fullUrl = appendParams(url, params);
    return await api.get(fullUrl, { headers, timeout: TIMEOUT_VALUE, signal });
  },

  post: async (url, body, setHeader = false) => {
    const headers = buildHeaders(setHeader);
    return await api.post(url, body, { headers, timeout: TIMEOUT_VALUE });
  },

  patch: async (url, body = null, setHeader = false) => {
    const headers = buildHeaders(setHeader);
    return await api.patch(url, body, { headers, timeout: TIMEOUT_VALUE });
  },

  delete: async (url, setHeader = false) => {
    const headers = buildHeaders(setHeader);
    return await api.delete(url, { headers, timeout: TIMEOUT_VALUE });
  },
};

export default HttpWrapper;
