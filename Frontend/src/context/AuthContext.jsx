import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('devspace_token') || null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Logout helper
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore network/auth errors during logout
    } finally {
      localStorage.removeItem('devspace_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  // Fetch current user profile
  const fetchProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('devspace_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const response = await api.get('/auth/profile');
      if (response.data && response.data.user) {
        setUser(response.data.user);
        return response.data.user;
      }
      setUser(null);
      return null;
    } catch (err) {
      console.warn('Failed to fetch profile or session expired:', err?.response?.data?.message || err.message);
      logout();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Initial check on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Listen for unauthorized events from axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('devspace:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('devspace:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      const { token: receivedToken, user: receivedUser } = response.data;
      localStorage.setItem('devspace_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Login failed. Please check your network and credentials.';
      throw new Error(errorMessage);
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password
      });

      const { token: receivedToken, user: receivedUser } = response.data;
      if (receivedToken) {
        localStorage.setItem('devspace_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
      }
      return receivedUser;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Registration failed. Please check your data and try again.';
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
