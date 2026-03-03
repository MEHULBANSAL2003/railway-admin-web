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


const appendId = (url, id) => {
  if (!id && id !== 0) return url;
  return `${url}/${id}`;
};

// Helper function to build headers
const buildHeaders = (setHeader = false) => {
  const headers = {};
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

  postByIdWithQueryParams: async (url, id, params = null, body = null, setHeader = false) => {
    const headers = buildHeaders(setHeader);
    let fullUrl = appendId(url, id);
    fullUrl = appendParams(fullUrl, params);
    return await api.post(fullUrl, body, { headers });
  },

  postFormData: async (url, fields = {}, setHeader = false) => {
    const headers = buildHeaders(setHeader);
    // Do NOT set Content-Type manually — axios sets it automatically
    // with the correct boundary when body is FormData
    delete headers['Content-Type'];

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return await api.post(url, formData, {
      headers,
      timeout: 120000
    });
  },

};
