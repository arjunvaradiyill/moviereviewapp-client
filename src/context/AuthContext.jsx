import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

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

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Format email to lowercase
      const formattedEmail = email.toLowerCase().trim();

      const response = await axios.post('/auth/login', {
        email: formattedEmail,
        password: password
      });

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid credentials');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (!error.response) {
        throw new Error('Unable to connect to server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to login');
      }
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/auth/register', {
        username,
        email,
        password,
      });

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid registration data');
      } else if (error.response?.status === 409) {
        throw new Error('User already exists');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (!error.response) {
        throw new Error('Unable to connect to server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to register');
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
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 