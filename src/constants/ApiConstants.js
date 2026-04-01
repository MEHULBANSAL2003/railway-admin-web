const BASE = import.meta.env.VITE_API_BASE_URL;

const ApiConstants = {
  BASE_URL: BASE,

  // Auth
  AUTH: {
    LOGIN_GOOGLE: `${BASE}/auth/admin/login/google`,
    REFRESH: `${BASE}/auth/admin/refresh`,
  },

  // Admin
  ADMIN: {
    BASE: `${BASE}/admin`,
    ME: `${BASE}/admin/me`,
    BY_ID: (id) => `${BASE}/admin/${id}`,
    TOGGLE_STATUS: (id) => `${BASE}/admin/${id}/toggle-status`,
    CHANGE_ROLE: (id) => `${BASE}/admin/${id}/change-role`,
    LOGOUT: `${BASE}/admin/logout`,
    MY_SESSION: `${BASE}/admin/me/session`,
  },

  // Users (Admin View)
  USER: {
    BY_ID: (id) => `${BASE}/admin/user/${id}`,
    STATUS_HISTORY: (id) => `${BASE}/admin/user/${id}/status-history`,
  },

  // Trains
  TRAINS: {
    BASE: `${BASE}/trains`,
    BY_ID: (id) => `${BASE}/trains/${id}`,
    STATUS: (id) => `${BASE}/trains/${id}/status`,
  },

  // Train Types
  TRAIN_TYPES: {
    BASE: `${BASE}/train-types`,
    BY_ID: (id) => `${BASE}/train-types/${id}`,
    STATUS: (id) => `${BASE}/train-types/${id}/status`,
  },

  // Coach Types
  COACH_TYPES: {
    BASE: `${BASE}/coach-types`,
    BY_ID: (id) => `${BASE}/coach-types/${id}`,
    STATUS: (id) => `${BASE}/coach-types/${id}/status`,
  },

  // Stations
  STATIONS: {
    BASE: `${BASE}/stations`,
    BY_ID: (id) => `${BASE}/stations/${id}`,
    SEARCH: `${BASE}/stations/search`,
  },

  // Quotas
  QUOTAS: {
    BASE: `${BASE}/quotas`,
    BY_ID: (id) => `${BASE}/quotas/${id}`,
    STATUS: (id) => `${BASE}/quotas/${id}/status`,
  },

  // Fare Rules
  FARE_RULES: {
    BASE: `${BASE}/fare-rules`,
    BY_ID: (id) => `${BASE}/fare-rules/${id}`,
  },

  // Schedules
  SCHEDULES: {
    BASE: `${BASE}/schedules`,
    BY_TRAIN: (trainId) => `${BASE}/trains/${trainId}/schedules`,
  },

  // Journeys
  JOURNEYS: {
    BASE: `${BASE}/journeys`,
    BY_TRAIN: (trainId) => `${BASE}/trains/${trainId}/journeys`,
  },
};

export default ApiConstants;
