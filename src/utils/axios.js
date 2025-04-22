import axios from 'axios';

// Define constants for ports
const API_PORT = 8001;

// Determine the environment
const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

// Vercel-specific environment detection
const isVercel = 
  window.location.hostname.includes('vercel.app') || 
  process.env.VERCEL || 
  process.env.VERCEL_ENV;

// In development, use local API; in production, use the production API URL
const getDevBaseUrl = () => {
  // Check if we are running locally
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Use the port from the current URL for local development
    const currentPort = window.location.port;
    // If running on port 3000, ensure we use that specific port for API
    if (currentPort === '3000') {
      return `http://localhost:${API_PORT}`;
    }
    return `http://localhost:${API_PORT}`;
  }
  // Default to the production URL if not running locally
  return 'https://entri-movie-server-0rwr.onrender.com';
};

const baseURL = getDevBaseUrl();

console.log('Using API URL:', baseURL, 'Environment:', isLocalhost ? 'local' : (isVercel ? 'Vercel' : 'production'));

// Create a simple axios instance without complex configurations
const instance = axios.create({
  baseURL,
  withCredentials: false, // Disable withCredentials for all environments to avoid CORS issues
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
    
    // Skip URL modification if the URL already contains /api or is an external URL
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

// Function to check if the server is available
export const checkServerAvailability = async () => {
  try {
    // Use fetch directly to avoid axios interceptors
    await fetch(`${baseURL}/api/health`, { 
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('Server is available');
    return true;
  } catch (error) {
    console.error('Server availability check failed:', error);
    return false;
  }
};

export default instance;