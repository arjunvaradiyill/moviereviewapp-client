import axios from 'axios';

// Determine the environment
const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

// The client typically runs on port 3000, but the API server runs on port 8000 in development
const API_PORT = 8000;
const CLIENT_PORT = 3000;

// Handle different development setups
const getDevBaseUrl = () => {
  // If running on localhost:3000, API is likely on localhost:8000
  if (isLocalhost && window.location.port === `${CLIENT_PORT}`) {
    return `http://localhost:${API_PORT}`;
  }
  // If running on a different port or the same port as API
  return window.location.origin;
};

// Use environment variable for API URL with proper fallbacks
const baseURL = process.env.REACT_APP_API_URL || 
  (isLocalhost ? getDevBaseUrl() : 'https://movie-review-server.onrender.com');

console.log('Using API URL:', baseURL);

// Check server availability
// eslint-disable-next-line no-unused-vars
const checkServerAvailability = async (url) => {
  // Simply return true - disable server availability checks
  return true;
  
  // Original implementation commented out to preserve it
  /*
  try {
    await fetch(`${url}/api/test`, { 
      method: 'GET',
      mode: 'no-cors',
      timeout: 2000 
    });
    return true;
  } catch (e) {
    console.warn(`Server at ${url} not responding:`, e);
    return false;
  }
  */
};

// Try to use local server if the remote one isn't responding and we're in development
// Disable this functionality since it's causing proxy errors
/*
if (!isLocalhost && process.env.NODE_ENV === 'development') {
  checkServerAvailability(baseURL).then(isAvailable => {
    if (!isAvailable) {
      console.warn('Remote server not responding, will try local server as fallback');
      checkServerAvailability('http://localhost:3000').then(isLocalAvailable => {
        if (isLocalAvailable) {
          console.log('Local server is available, switching to it');
          instance.defaults.baseURL = 'http://localhost:3000';
        }
      });
    }
  });
}
*/

// Create a custom axios instance with retry capability
const instance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add retry configuration 
instance.defaults.raxConfig = {
  retry: 2, // number of retries
  retryDelay: 1000, // 1s between retries
  // Only retry GET requests and timeouts
  shouldRetry: (error) => {
    const { config, code } = error;
    // Check for custom retry options in the request config
    if (config.retry === true) {
      return true;
    }
    
    // Only retry GET requests
    const isIdempotent = config.method === 'get';
      
    // Only retry timeouts and 5xx errors (not 4xx errors)
    const isTimeout = code === 'ECONNABORTED' && error.message.includes('timeout');
    const isServerError = error.response && error.response.status >= 500;
    
    return isIdempotent && (isTimeout || isServerError);
  }
};

// Attach retry interceptor
let isRetryActive = false;

// Add a request interceptor to add the auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Override timeout if specified
    if (config.timeout) {
      // config already has timeout set, don't modify
    } else if (config.url && (
      config.url.includes('/auth/login') || 
      config.url.includes('/auth/register')
    )) {
      // Use longer timeout for auth operations
      config.timeout = 20000; // 20 seconds
    }
    
    // Handle API path
    // Don't prepend /api if it's already there or it's a full URL or it contains /auth/
    if (!config.url.startsWith('/api') && 
        !config.url.startsWith('http') &&
        !config.url.includes('/auth/')) {
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
  async (error) => {
    // Extract request config
    const { config, code, message } = error;
    
    // If no config, it's not a request error that can be retried
    if (!config || !instance.defaults.raxConfig.shouldRetry(error) || isRetryActive) {
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.warn('Authentication token expired or invalid, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Handle timeout errors
      if (code === 'ECONNABORTED' && message.includes('timeout')) {
        console.error('Request timed out. Please try again later.');
        // You can dispatch an action to show a global notification here
      }
      
      // Handle network errors
      if (message === 'Network Error') {
        console.error('Network error. Please check your internet connection.');
        // You can dispatch an action to show a global notification here
      }
      
      return Promise.reject(error);
    }
    
    // This is a retryable request, let's retry it
    isRetryActive = true;
    let retryCount = config.retryCount || 0;
    
    // Get max retries, default to global setting or use custom maxRetries if provided
    const maxRetries = config.maxRetries || instance.defaults.raxConfig.retry;
    
    // Don't retry too many times
    if (retryCount >= maxRetries) {
      isRetryActive = false;
      return Promise.reject(error);
    }
    
    // Increase retry count
    retryCount += 1;
    const newConfig = { ...config, retryCount };
    
    // Delay the retry (use custom retryDelay if provided)
    const delay = config.retryDelay || instance.defaults.raxConfig.retryDelay;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log(`Retrying request (${retryCount}/${maxRetries}): ${newConfig.url}`);
    isRetryActive = false;
    return instance(newConfig);
  }
);

export default instance; 