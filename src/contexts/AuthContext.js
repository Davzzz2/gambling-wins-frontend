import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          const isValid = await api.verifyToken();
          if (isValid) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(userData.role === 'admin');
          } else {
            // Token is invalid, clear auth state
            logout();
          }
        } catch (error) {
          console.error('Error verifying auth:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Periodic token validation
  useEffect(() => {
    if (!isAuthenticated) return;

    const validateToken = async () => {
      try {
        const isValid = await api.verifyToken();
        if (!isValid) {
          logout();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        logout();
      }
    };

    const interval = setInterval(validateToken, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (userData) => {
    try {
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'admin');
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      api.logout();
    } catch (error) {
      console.error('Error in logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  const value = {
    isAuthenticated,
    isAdmin,
    user,
    login,
    logout,
    loading
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 
