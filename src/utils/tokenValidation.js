import { jwtDecode } from 'jwt-decode';
import { STORAGE_KEYS } from '../constants/AppConstants.js';
import { Storage } from './storage.js';

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Validate access token and refresh token
 */
export const validateTokens = () => {
  const accessToken = Storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = Storage.get(STORAGE_KEYS.REFRESH_TOKEN);

  if (!accessToken || !refreshToken) {
    return { valid: false, reason: 'TOKENS_MISSING' };
  }

  const refreshExpired = isTokenExpired(refreshToken);
  if (refreshExpired) {
    return { valid: false, reason: 'REFRESH_TOKEN_EXPIRED' };
  }

  const accessExpired = isTokenExpired(accessToken);
  if (accessExpired) {
    return { valid: false, reason: 'ACCESS_TOKEN_EXPIRED', canRefresh: true };
  }

  return { valid: true };
};

/**
 * Clear all auth data and redirect to login
 */
export const forceLogout = (navigate) => {
  Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
  Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  Storage.remove(STORAGE_KEYS.USER);
  navigate('/login', { replace: true });
};
