import { Navigate } from 'react-router-dom';
import { validateTokens } from '../utils/tokenValidation';
import { STORAGE_KEYS } from '../constants/AppConstants.js';
import { Storage } from '../utils/storage.js';

const ProtectedRoute = ({ children }) => {
  const accessToken = Storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = Storage.get(STORAGE_KEYS.REFRESH_TOKEN);

  if (!accessToken || !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  const { valid, reason } = validateTokens();

  if (!valid && reason === 'REFRESH_TOKEN_EXPIRED') {
    Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    Storage.remove(STORAGE_KEYS.USER);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
