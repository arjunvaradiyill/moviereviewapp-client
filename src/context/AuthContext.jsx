import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const userData = JSON.parse(storedUser);
        // Ensure profilePicture exists even if null to avoid rendering issues
        if (!userData.profilePicture) {
          userData.profilePicture = '';
        }
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Add a function to fetch the latest user profile
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/users/me');
      
      if (response.data) {
        // Update user state with complete user data
        setUser(response.data);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't throw error to avoid disrupting login flow
    }
  };

  const login = async (email, password) => {
    try {
      // Client-side validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('Attempting login...');
      
      // Always use the API server based on environment
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocalhost 
        ? 'http://localhost:8001' 
        : 'https://entri-movie-server-0rwr.onrender.com';
      
      console.log('Login using API URL:', apiUrl);
      console.log('Sending login request with email:', email);
      
      // Make direct request to auth endpoint
      const response = await axios({
        method: 'post',
        url: '/api/auth/login',
        baseURL: apiUrl,
        data: { email, password },
        withCredentials: false, // Disable withCredentials to avoid CORS issues
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Login response received:', response.status);
      
      if (response.status === 200 && response.data.token) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update context state
        setToken(response.data.token);
        setUser(response.data.user);
        
        // Fetch the complete user profile to get the latest data
        await fetchUserProfile();
        
        // Navigate directly to the home page after successful login
        navigate('/home');
        
        return response.data;
      } else {
        console.log('Invalid response format:', response.data);
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message === 'Network Error') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const register = async (username, email, password) => {
    try {
      // Validate input
      if (!username || !email || !password) {
        throw new Error('All fields are required');
      }

      // Format email to lowercase
      const formattedEmail = email.toLowerCase().trim();
      
      console.log('Attempting registration...');

      // Always use the API server based on environment
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocalhost 
        ? 'http://localhost:8001' 
        : 'https://entri-movie-server-0rwr.onrender.com';
      
      console.log('Register using API URL:', apiUrl);
      
      // Make direct request to auth endpoint
      const response = await axios({
        method: 'post',
        url: '/api/auth/register',
        baseURL: apiUrl,
        data: {
          username,
          email: formattedEmail,
          password
        },
        withCredentials: false, // Disable withCredentials to avoid CORS issues
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      // Instead of logging the user in automatically, redirect to login page
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in with your credentials.',
          email: formattedEmail
        } 
      });

      return { user: response.data.user }; // Return user data in case it's needed
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors
          .map(err => err.msg)
          .join(', ');
        throw new Error(validationErrors);
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid registration data');
      } else if (error.response?.status === 409) {
        throw new Error('User already exists');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.message === 'Network Error') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to register');
      }
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/users/me', userData);
      
      if (response.data) {
        // Update user state with new data
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed');
      } else if (!error.response) {
        throw new Error('Unable to connect to server. Please check your connection.');
      } else {
        throw new Error('Failed to update profile');
      }
    }
  };

  const updateProfilePicture = async (profilePicture) => {
    try {
      const response = await axios.put('/users/me/profile-picture', { profilePicture });
      
      if (response.data) {
        // Update user state with new profile picture
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      }
    } catch (error) {
      console.error('Profile picture update error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed');
      } else if (!error.response) {
        throw new Error('Unable to connect to server. Please check your connection.');
      } else {
        throw new Error('Failed to update profile picture');
      }
    }
  };

  const uploadProfilePicture = async (file) => {
    try {
      // Create form data object
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      // Configure the request to handle form data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axios.post('/users/me/profile-picture/upload', formData, config);
      
      if (response.data) {
        // Update user state with new profile picture URL
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid file. Please upload an image file under 5MB.');
      } else if (!error.response) {
        throw new Error('Unable to connect to server. Please check your connection.');
      } else {
        throw new Error('Failed to upload profile picture');
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout,
      setUser,
      updateProfile,
      updateProfilePicture,
      uploadProfilePicture,
      fetchUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 