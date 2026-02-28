import { jwtDecode } from 'jwt-decode';
import {common} from "../constants/common.js"; // Install: npm install jwt-decode

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    // Token is expired if exp is less than current time
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Treat invalid tokens as expired
  }
};

/**
 * Validate access token and refresh token
 */
export const validateTokens = () => {
  const accessToken = common.getAccessToken();
  const refreshToken = common.getRefreshToken();

  // Both tokens must exist
  if (!accessToken || !refreshToken) {
    return { valid: false, reason: 'TOKENS_MISSING' };
  }

  // Check if access token is expired
  const accessExpired = isTokenExpired(accessToken);

  // Check if refresh token is expired
  const refreshExpired = isTokenExpired(refreshToken);

  // If refresh token is expired, user must login again
  if (refreshExpired) {
    return { valid: false, reason: 'REFRESH_TOKEN_EXPIRED' };
  }

  // If access token is expired but refresh token is valid
  // This is where you'd call refresh token API
  if (accessExpired && !refreshExpired) {
    return { valid: false, reason: 'ACCESS_TOKEN_EXPIRED', canRefresh: true };
  }

  // Both tokens are valid
  return { valid: true };
};

/**
 * Clear all auth data and redirect to login
 */
export const forceLogout = (navigate) => {
  common.logout();
  navigate('/login', { replace: true });
};
