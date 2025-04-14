import axios from 'axios';

// Use environment variable for API URL with fallback
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('Using API URL:', baseURL);

const instance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000, // Add timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor to add the auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle API path
    if (!config.url.startsWith('/api') && !config.url.startsWith('http')) {
      config.url = `/api${config.url}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('Authentication token expired or invalid, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default instance; 