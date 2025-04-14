import axios from 'axios';

// Use environment variable for API URL with fallback
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('Using API URL:', baseURL);

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
    // Only retry GETs or specific non-mutation requests
    const isIdempotent = config.method === 'get' || 
      (config.url && (
        config.url.includes('/health') || 
        config.url.includes('/api/test')
      ));
      
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
    
    // Handle API path
    if (!config.url.startsWith('/api') && !config.url.startsWith('http') && !config.url.startsWith('/health')) {
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
    
    // Don't retry too many times
    if (retryCount >= instance.defaults.raxConfig.retry) {
      isRetryActive = false;
      return Promise.reject(error);
    }
    
    // Increase retry count
    retryCount += 1;
    const newConfig = { ...config, retryCount };
    
    // Delay the retry
    const delay = instance.defaults.raxConfig.retryDelay;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log(`Retrying request (${retryCount}/${instance.defaults.raxConfig.retry}): ${newConfig.url}`);
    isRetryActive = false;
    return instance(newConfig);
  }
);

export default instance; 