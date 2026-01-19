import axios from 'axios';
import {common} from "../constants/common.js";


const timeOutValue = 10000;
const api = axios.create({
  timeout: timeOutValue, // 30 seconds
});

export const HttpWrapper = {

  get: async (url, params = null, setHeader = false, signal = null) => {
    try {
      const token = common.getToken();
      let userId = common.getUserData('id');

      if (typeof userId !== 'string' && userId !== null) {
        userId = userId.toString();
      }

      const headers = {
        app_id: (common?.getAppId() || '').toString(),
        business_id: (common?.getBusinessId() || '').toString(),
        app_version: common.getAppVersion() || '1.0.0',
      };

      if (setHeader && token) {
        headers['Content-Type'] = 'application/json';
        headers['Authorization'] = `Bearer ${token}`;
        headers['id'] = userId;
      } else if (setHeader && !token) {
        headers['Content-Type'] = 'application/json';
        headers['id'] = '-1';
      }

      if (params) {
        const query = new URLSearchParams(params).toString();
        url = `${url}?${query}`;
      }

      return await api.get(url, {
        headers,
        timeout: timeOutValue,
        signal,
      });
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('Unauthorized (401): Logging out user...');
        common.logout();
      }
      throw error;
    }
  },

  postParamsHeader: async (url, params = null, setHeader = false) => {
    try {
      let userId = common.getUserData('id');

      if (typeof userId !== 'string' && userId !== null) {
        userId = userId.toString();
      }

      const token = common.getToken();

      const headers = {
        app_id: (common?.getAppId() || '').toString(),
        business_id: (common?.getBusinessId() || '').toString(),
        app_version: common.getAppVersion() || '1.0.0',
      };

      if (setHeader) {
        headers['Authorization'] = `Bearer ${token || ''}`;
        headers['id'] = userId;
      }

      if (params) {
        const param = Object.keys(params)
          .map((key) => `${key}=${params[key]}`)
          .join('&');
        url = `${url}?${param}`;
      }

      const response = await api.post(url, null, { headers });
      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('Unauthorized (401): Logging out user...');
        common.logout();
      }
      throw error;
    }
  },

  /**
   * POST request with FormData
   * @param {string} url - API endpoint
   * @param {object} params - Form data parameters
   * @param {boolean} setHeader - Include auth headers
   * @returns {Promise} Axios response
   */
  postParams: async (url, params = null, setHeader = false) => {
    try {
      let userId = common.getUserData('id');

      if (typeof userId !== 'string' && userId !== null) {
        userId = userId.toString();
      }

      const token = common.getToken();

      const headers = {
        app_id: (common?.getAppId() || '').toString(),
        business_id: (common?.getBusinessId() || '').toString(),
        app_version: common.getAppVersion() || '1.0.0',
      };

      if (setHeader) {
        headers['Authorization'] = `Bearer ${token || ''}`;
        headers['id'] = userId;
      }

      const formData = new FormData();
      if (params && typeof params === 'object') {
        for (const param in params) {
          formData.append(param, params[param]);
        }
      }

      const response = await api.post(url, formData, { headers });
      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('Unauthorized (401): Logging out user...');
        common.logout();
      }
      throw error;
    }
  },

  /**
   * POST request with JSON body
   * @param {string} url - API endpoint
   * @param {object} body - Request body
   * @param {boolean} setHeader - Include auth headers
   * @returns {Promise} Axios response
   */
  post: async (url, body, setHeader = false) => {
    try {
      let userId = common.getUserData('id');

      if (typeof userId !== 'string' && userId !== null) {
        userId = userId.toString();
      }

      const token = common.getToken();

      const headers = {
        app_id: (common?.getAppId() || '').toString(),
        business_id: (common?.getBusinessId() || '').toString(),
        app_version: common.getAppVersion() || '1.0.0',
      };

      if (setHeader) {
        headers['Authorization'] = `Bearer ${token || ''}`;
        headers['id'] = userId;
      }

      const response = await api.post(url, body, { headers });
      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('Unauthorized (401): Logging out user...');
        common.logout();
      }
      throw error;
    }
  },

  /**
   * DELETE request
   * @param {string} url - API endpoint
   * @param {object} params - Query parameters
   * @param {boolean} setHeader - Include auth headers
   * @returns {Promise} Axios response
   */
  deleteParams: async (url, params = null, setHeader = false) => {
    try {
      let userId = common.getUserData('id');

      if (typeof userId !== 'string' && userId !== null) {
        userId = userId.toString();
      }

      const token = common.getToken();

      const headers = {};

      if (setHeader) {
        headers['Authorization'] = `Bearer ${token || ''}`;
        headers['id'] = userId;
        headers['app_id'] = (common?.getAppId() || '').toString();
        headers['business_id'] = (common?.getBusinessId() || '').toString();
        headers['app_version'] = common.getAppVersion() || '1.0.0';
      }

      if (params) {
        const query = new URLSearchParams(params).toString();
        url = `${url}?${query}`;
      }

      return await api.delete(url, { headers });
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('Unauthorized (401): Logging out user...');
        common.logout();
      }
      throw error;
    }
  },

  /**
   * POST request with JSON payload
   * @param {string} url - API endpoint
   * @param {object} params - JSON data
   * @param {boolean} setHeader - Include auth headers
   * @returns {Promise} Axios response
   */
  postJson: async (url, params = null, setHeader = false) => {
    try {
      let userId = common.getUserData('id');

      if (typeof userId !== 'string' && userId !== null) {
        userId = userId.toString();
      }

      const token = common.getToken();

      const headers = {
        app_id: (common?.getAppId() || '').toString(),
        business_id: (common?.getBusinessId() || '').toString(),
        app_version: common.getAppVersion() || '1.0.0',
      };

      if (setHeader) {
        headers['Authorization'] = `Bearer ${token || ''}`;
        headers['id'] = userId;
      }

      const response = await api.post(url, params, { headers });
      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('Unauthorized (401): Logging out user...');
        common.logout();
      }
      throw error;
    }
  },

  postHeaderBodyAndParams: async (url, params = null, body, setHeader = false) => {
    try {
      let userId = common.getUserData('id');

      if (typeof userId !== 'string' && userId !== null) {
        userId = userId.toString();
      }

      const token = common.getToken();

      const headers = {
        app_id: (common?.getAppId() || '').toString(),
        business_id: (common?.getBusinessId() || '').toString(),
        app_version: common.getAppVersion() || '1.0.0',
      };

      if (setHeader) {
        headers['Authorization'] = `Bearer ${token || ''}`;
        headers['id'] = userId;
      }

      if (params) {
        const param = Object.keys(params)
          .map((key) => `${key}=${params[key]}`)
          .join('&');
        url = `${url}?${param}`;
      }

      return await axios.post(url, body, { headers });
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('Unauthorized (401): Logging out user...');
        common.logout();
      }
      throw error;
    }
  },
};


