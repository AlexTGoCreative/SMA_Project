import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from storage on app start
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const loggedIn = await api.isLoggedIn();
      if (loggedIn) {
        const storedUser = await api.getStoredUser();
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const { name, email, password } = userData;
      await api.register(name, email, password);
      
      const storedUser = await api.getStoredUser();
      setUser(storedUser);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: typeof error === 'string' ? error : 'Registration failed',
      };
    }
  };

  const login = async (email, password) => {
    try {
      await api.login(email, password);
      
      const storedUser = await api.getStoredUser();
      setUser(storedUser);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still log out locally even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, message: 'Failed to update user' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

