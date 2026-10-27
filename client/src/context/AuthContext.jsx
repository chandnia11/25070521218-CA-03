// client/src/context/AuthContext.jsx
// React Context providing user, token, loading state, and auth methods

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

const TOKEN_KEY = 'stylemuse_token';
const USER_KEY = 'stylemuse_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage on application start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken) {
        try {
          // Verify token validity with backend /api/auth/me
          const response = await authService.getCurrentUser(storedToken);
          if (response && response.user) {
            setToken(storedToken);
            setUser(response.user);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          } else {
            // Unexpected response, clear session
            clearSession();
          }
        } catch (error) {
          console.warn('Session verification failed, logging out:', error.message);
          clearSession();
        }
      } else if (storedUser) {
        // Stored user without token is invalid
        clearSession();
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   */
  const signup = async (userData) => {
    const response = await authService.signup(userData);
    if (response && response.token && response.user) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  /**
   * Log in an existing user
   * @param {Object} credentials - { email, password }
   */
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response && response.token && response.user) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  /**
   * Log out current user
   */
  const logout = () => {
    clearSession();
  };

  const value = {
    user,
    token,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming auth context easily in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
