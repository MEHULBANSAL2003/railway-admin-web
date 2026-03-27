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

          if (canRefresh) {
            // Access token expired but refresh token valid —
            // the interceptor will handle refresh on next API call
            setIsAuthenticated(true);
          } else {
            forceLogout(navigate);
            setIsAuthenticated(false);
          }
        } else {
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
