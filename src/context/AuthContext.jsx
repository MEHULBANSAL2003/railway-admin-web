import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import storage from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/AppConstants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from storage on mount
  useEffect(() => {
    const savedUser = storage.get(STORAGE_KEYS.USER);
    const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (savedUser && token) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
    storage.set(STORAGE_KEYS.USER, userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
