import axios from 'axios';

// Determine the environment
const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

// In development, use local API; in production, use the production API URL
const baseURL = isLocalhost 
  ? 'http://localhost:8000' 
  : (process.env.REACT_APP_API_URL || 'https://movie-review-server.onrender.com');

console.log('Using API URL:', baseURL);

// Create a simple axios instance without complex configurations
const instance = axios.create({
  baseURL,
  withCredentials: isLocalhost ? true : false, // Only use withCredentials in local development
  timeout: 45000, // 45 second timeout for all requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor to add the auth token
instance.interceptors.request.use(
  (config) => {
    // Add the auth token to headers
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Skip URL modification if the URL already contains auth/ as it now includes /api
    if (!config.url.startsWith('/api') && 
        !config.url.startsWith('http') && 
        !config.url.includes('://')) {
      config.url = `/api${config.url}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a simple response interceptor to handle auth errors
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