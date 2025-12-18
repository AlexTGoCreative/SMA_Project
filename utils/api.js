import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

// Add timeout to axios requests
axios.defaults.timeout = 10000; // 10 seconds

export const api = {
  // Register new user
  register: async (name, email, password) => {
    try {
      console.log('Attempting registration to:', `${API_URL}/register`);
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
      });
      
      console.log('Registration successful:', response.data);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.message);
      console.error('Error details:', error.response?.data || error);
      
      if (error.code === 'ECONNABORTED') {
        throw 'Connection timeout. Make sure backend server is running.';
      }
      if (error.message === 'Network Error') {
        throw 'Cannot connect to server. Check if backend is running on http://192.168.255.48:3000';
      }
      throw error.response?.data?.error || error.message || 'Registration failed';
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      console.log('Attempting login to:', `${API_URL}/login`);
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      
      console.log('Login successful:', response.data);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.message);
      console.error('Error details:', error.response?.data || error);
      
      if (error.code === 'ECONNABORTED') {
        throw 'Connection timeout. Make sure backend server is running.';
      }
      if (error.message === 'Network Error') {
        throw 'Cannot connect to server. Check if backend is running on http://192.168.255.48:3000';
      }
      throw error.response?.data?.error || error.message || 'Login failed';
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch profile';
    }
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },

  // Get stored user
  getStoredUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

