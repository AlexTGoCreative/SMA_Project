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

  // ===== LISTING API METHODS =====

  // Create a new listing
  createListing: async (listingData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Creating listing:', listingData);
      
      const response = await axios.post(`${API_URL}/listings`, listingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Listing created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create listing error:', error.message);
      console.error('Error details:', error.response?.data || error);
      throw error.response?.data?.error || 'Failed to create listing';
    }
  },

  // Get all listings
  getListings: async (status = 'active') => {
    try {
      const response = await axios.get(`${API_URL}/listings`, {
        params: { status },
      });
      return response.data.listings;
    } catch (error) {
      console.error('Get listings error:', error.message);
      throw error.response?.data?.error || 'Failed to fetch listings';
    }
  },

  // Get single listing by ID
  getListing: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/listings/${id}`);
      return response.data.listing;
    } catch (error) {
      console.error('Get listing error:', error.message);
      throw error.response?.data?.error || 'Failed to fetch listing';
    }
  },

  // Get user's own listings
  getMyListings: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/my-listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.listings;
    } catch (error) {
      console.error('Get my listings error:', error.message);
      throw error.response?.data?.error || 'Failed to fetch your listings';
    }
  },

  // Update listing
  updateListing: async (id, listingData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}/listings/${id}`, listingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update listing error:', error.message);
      throw error.response?.data?.error || 'Failed to update listing';
    }
  },

  // Delete listing
  deleteListing: async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Delete listing error:', error.message);
      throw error.response?.data?.error || 'Failed to delete listing';
    }
  },
};

