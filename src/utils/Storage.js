// utils/storage.js

/**
 * Check if code is running in browser environment
 */
export const isBrowser = typeof window !== 'undefined';

export const Storage = {
  set: (key, value) => {
    if (!isBrowser) return;

    try {
      const valueToStore = typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  get: (key) => {
    if (!isBrowser) return null;

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);
      return null;
    }
  },

  getJSON: (key) => {
    if (!isBrowser) return null;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error parsing JSON from localStorage key "${key}":`, error);
      return null;
    }
  },

  remove: (key) => {
    if (!isBrowser) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear: () => {
    if (!isBrowser) return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  has: (key) => {
    if (!isBrowser) return false;
    return localStorage.getItem(key) !== null;
  },

  keys: () => {
    if (!isBrowser) return [];
    return Object.keys(localStorage);
  },

  length: () => {
    if (!isBrowser) return 0;
    return localStorage.length;
  },
};

export default Storage;
