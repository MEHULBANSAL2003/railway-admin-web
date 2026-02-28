import { Navigate } from 'react-router-dom';
import { validateTokens } from '../utils/tokenValidation';
import {common} from "../constants/common.js";

const ProtectedRoute = ({ children }) => {
  const accessToken = common.getAccessToken();
  const refreshToken = common.getRefreshToken();

  // Check if tokens exist
  if (!accessToken || !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  // Validate tokens
  const { valid, reason } = validateTokens();

  // If tokens are invalid and can't be refreshed, redirect to login
  if (!valid && reason === 'REFRESH_TOKEN_EXPIRED') {
    common.logout();
    return <Navigate to="/login" replace />;
  }

  // If tokens are valid or can be refreshed, allow access
  return children;
};

export default ProtectedRoute;
