import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateTokens, forceLogout } from '../utils/tokenValidation';

export const useAuthInit = () => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { valid, reason, canRefresh } = validateTokens();

        if (!valid) {
          console.log('Token validation failed:', reason);

          // If refresh token is valid, try to refresh access token
          if (canRefresh) {
            // TODO: Call refresh token API here
            // const newAccessToken = await refreshAccessToken();
            // if (newAccessToken) {
            //   common.setAccessToken(newAccessToken);
            //   setIsAuthenticated(true);
            //   return;
            // }
          }

          // Logout user if tokens are invalid
          forceLogout(navigate);
          setIsAuthenticated(false);
        } else {
          // Tokens are valid
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        forceLogout(navigate);
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    initAuth();
  }, [navigate]);

  return { isValidating, isAuthenticated };
};
