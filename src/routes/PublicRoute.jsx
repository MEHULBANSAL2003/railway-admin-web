import { Navigate } from 'react-router-dom';
import { validateTokens } from '../utils/tokenValidation';
import { STORAGE_KEYS } from '../constants/AppConstants.js';
import { Storage } from '../utils/storage.js';

const PublicRoute = ({ children }) => {
  const accessToken = Storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = Storage.get(STORAGE_KEYS.REFRESH_TOKEN);

  if (!accessToken || !refreshToken) {
    return children;
  }

  const { valid } = validateTokens();

  if (valid) {
    return <Navigate to="/dashboard" replace />;
  }

  // Tokens invalid, clear and allow access
  Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
  Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  Storage.remove(STORAGE_KEYS.USER);
  return children;
};

export default PublicRoute;
