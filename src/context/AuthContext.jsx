import { createContext, useContext, useState, useEffect } from 'react';
import {common} from "../constants/common.js";
import {AuthService} from "../services/AuthService.js";
import {useToast} from "./Toast/useToast.js";
import {useNavigate} from "react-router-dom";


const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);  // Current logged-in user
  const [loading, setLoading] = useState(true);  // Loading state
  const {showSuccess, showError} = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth().then();
  }, []);

  const checkAuth = async () => {
    const token = common?.getAccessToken();
    const savedUser = common?.getUserData();

    if (token && savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  };

  const login = async (authToken) => {
    try {
      const payload = {
        google_auth_token: authToken,
      }
      const response = await AuthService.loginByEmail(payload);
      if(response?.data?.status === 'success'){
        showSuccess("logged in successfully!");
        common.setUserData(response?.data?.data);
        common.setAccessToken(response?.data?.data?.accessToken);
        common.setRefreshToken(response?.data?.data?.refreshToken);
        navigate("/dashboard");
      }
      else{
        showError('something went wrong');
      }

    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {

    } catch (error) {

    } finally {

    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    common.setUserData(userData);
  };

  const value = {user, login, logout, updateUser, isAuthenticated: !!user, loading,};

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
