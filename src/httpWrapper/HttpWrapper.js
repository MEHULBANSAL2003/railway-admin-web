import axios from 'axios';
import { setupInterceptors } from './interceptors';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(httpClient);

const http = {
  get(url, config = {}) {
    return httpClient.get(url, config);
  },

  post(url, data = {}, config = {}) {
    return httpClient.post(url, data, config);
  },

  put(url, data = {}, config = {}) {
    return httpClient.put(url, data, config);
  },

  patch(url, data = {}, config = {}) {
    return httpClient.patch(url, data, config);
  },

  delete(url, config = {}) {
    return httpClient.delete(url, config);
  },
};

export default http;
