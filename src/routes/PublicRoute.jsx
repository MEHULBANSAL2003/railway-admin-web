import { Navigate } from 'react-router-dom';
import { validateTokens } from '../utils/tokenValidation';
import {common} from "../constants/common.js";

const PublicRoute = ({ children }) => {
  const accessToken = common.getAccessToken();
  const refreshToken = common.getRefreshToken();

  // If no tokens, allow access to public routes
  if (!accessToken || !refreshToken) {
    return children;
  }

  // Validate tokens
  const { valid } = validateTokens();

  // If tokens are valid, redirect to dashboard
  if (valid) {
    return <Navigate to="/dashboard" replace />;
  }

  // If tokens are invalid, clear them and allow access
  common.logout();
  return children;
};

export default PublicRoute;
