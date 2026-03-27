import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/AppConstants.js';
import { Storage } from '../utils/storage.js';
import { AuthService } from '../services/AuthService.js';
import { useToast } from './Toast/useToast.js';
import { useNavigate } from 'react-router-dom';
import { useLoader } from '../hooks/useLoader.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = Storage.get(STORAGE_KEYS.ACCESS_TOKEN);
      const savedUser = Storage.getJSON(STORAGE_KEYS.USER);
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

  const login = async (idToken) => {
    try {
      const response = await AuthService.loginWithGoogle(idToken);

      if (response?.data?.status === 'success') {
        const userData = response.data.data;

        Storage.set(STORAGE_KEYS.ACCESS_TOKEN, userData.accessToken);
        Storage.set(STORAGE_KEYS.REFRESH_TOKEN, userData.refreshToken);
        Storage.set(STORAGE_KEYS.USER, userData);

        setUser(userData);
        showSuccess('Logged in successfully!');
        navigate('/dashboard');
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
      showLoader('Logging out...');
      const refreshToken = Storage.get(STORAGE_KEYS.REFRESH_TOKEN);
      const response = await AuthService.logout(refreshToken);

      if (response?.data?.status === 'success') {
        Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        Storage.remove(STORAGE_KEYS.USER);
        setUser(null);
        showSuccess(response?.data?.data?.message || 'Logged out successfully');
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear anyway on error
      Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      Storage.remove(STORAGE_KEYS.USER);
      setUser(null);
      navigate('/login');
    } finally {
      hideLoader();
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    Storage.set(STORAGE_KEYS.USER, userData);
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
