import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastTokenCheck, setLastTokenCheck] = useState(0);

  // Initialize auth state from secure storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verify token is still valid
          const isValid = await api.verifyToken();
          if (isValid) {
            setUser(userData);
          } else {
            // Clear invalid auth state
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Periodic token validation
  useEffect(() => {
    const validateToken = async () => {
      try {
        const now = Date.now();
        // Check token every 5 minutes
        if (now - lastTokenCheck > 5 * 60 * 1000) {
          const isValid = await api.verifyToken();
          if (!isValid) {
            handleLogout();
          }
          setLastTokenCheck(now);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        handleLogout();
      }
    };

    if (user) {
      const interval = setInterval(validateToken, 60 * 1000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user, lastTokenCheck]);

  const login = useCallback(async (userData) => {
    try {
      setUser(userData);
      // Additional security measures handled by api service
    } catch (error) {
      console.error('Login error:', error);
      handleLogout();
    }
  }, []);

  const handleLogout = useCallback(() => {
    // Clear auth state
    setUser(null);
    
    // Clear secure storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Clear any cached API data
    api.clearCache();
    
    // Invalidate token on server
    try {
      api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    login,
    logout: handleLogout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 
