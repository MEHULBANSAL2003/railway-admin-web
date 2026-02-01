import { createContext, useContext, useState, useEffect } from 'react';
import {common} from "../constants/common.js";
import {AuthService} from "../services/AuthService.js";
import {useToast} from "./Toast/useToast.js";
import {useNavigate} from "react-router-dom";
import {useLoader} from "../hooks/useLoader.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const {showSuccess, showError} = useToast();
  const navigate = useNavigate();
  const {showLoader, hideLoader} = useLoader();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = common.getAccessToken();
      const savedUser = common.getUserData();

      if (token && savedUser) {
        setUser(savedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (authToken) => {
    try {
      const payload = {
        google_auth_token: authToken,
      };

      const response = await AuthService.loginByEmail(payload);

      if (response?.data?.status === 'success') {
        const userData = response.data.data;
        common.setUserData(userData);
        common.setAccessToken(userData.accessToken);
        common.setRefreshToken(userData.refreshToken);

        setUser(userData);
        showSuccess("Logged in successfully!");
        navigate("/dashboard");
      } else {
        showError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(error.response?.data?.message || 'Something went wrong');
    }
  };

  const logout = async () => {
    try {
       showLoader("Logging out...");
      const payload = {
        refreshToken: common.getRefreshToken(),
      }
      const response = await AuthService.logoutCurrentDevice(payload);
      if(response?.data?.status === 'success') {
        // Clear all auth data
        common.logout();
        setUser(null);
        showSuccess(response?.data?.data?.message);
        navigate("/login");
      }
    } catch (error) {
      console.error('Logout error:', error);
      showError('Logout failed');
    }
    finally {
      hideLoader();
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    common.setUserData(userData);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
