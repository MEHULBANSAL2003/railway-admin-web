import { createContext, useContext, useState, useEffect } from 'react';
import {common} from "../constants/common.js";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);  // Current logged-in user
  const [loading, setLoading] = useState(true);  // Loading state

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = common?.getToken();
    const savedUser = common?.getUserData();

    if (token && savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {

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
