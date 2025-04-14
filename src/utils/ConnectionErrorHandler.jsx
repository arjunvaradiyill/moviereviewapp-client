import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Button, CircularProgress, Box, Typography } from '@mui/material';
import axios from './axios';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ConnectionErrorHandler = () => {
  const [connectionError, setConnectionError] = useState(false);
  const [errorType, setErrorType] = useState('');
  const [checking, setChecking] = useState(false);
  
  useEffect(() => {
    // Function to check server connection
    const checkConnection = async () => {
      if (checking) return;
      
      setChecking(true);
      try {
        await axios.get('/api/test', { timeout: 5000 }); // Shorter timeout for status check
        setConnectionError(false);
        setErrorType('');
      } catch (error) {
        console.error('Server connection error:', error);
        setConnectionError(true);
        
        // Identify error type
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
          setErrorType('timeout');
        } else if (error.message === 'Network Error') {
          setErrorType('network');
        } else {
          setErrorType('server');
        }
      } finally {
        setChecking(false);
      }
    };
    
    // Check connection on mount
    checkConnection();
    
    // Set up periodic connection checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    // Add global axios error listener to detect new issues
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // If it's a timeout or network error, update the state
        if (
          (error.code === 'ECONNABORTED' && error.message.includes('timeout')) ||
          error.message === 'Network Error'
        ) {
          checkConnection();
        }
        return Promise.reject(error);
      }
    );
    
    // Clean up
    return () => {
      clearInterval(interval);
      axios.interceptors.response.eject(interceptor);
    };
  }, [checking]);
  
  const handleRetry = () => {
    setConnectionError(false);
    window.location.reload();
  };
  
  const getErrorMessage = () => {
    switch (errorType) {
      case 'timeout':
        return 'Request timed out. The server is taking too long to respond.';
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection.';
      case 'server':
      default:
        return 'Server error. Please try again later.';
    }
  };
  
  if (!connectionError) {
    return null;
  }
  
  return (
    <Snackbar
      open={connectionError}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        severity="error" 
        variant="filled"
        icon={<ErrorOutlineIcon />}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {checking ? (
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
            ) : null}
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRetry}
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Retry'}
            </Button>
          </Box>
        }
        sx={{ 
          alignItems: 'center',
          '& .MuiAlert-message': { 
            display: 'flex', 
            alignItems: 'center' 
          }
        }}
      >
        <Typography variant="body2">{getErrorMessage()}</Typography>
      </Alert>
    </Snackbar>
  );
};

export default ConnectionErrorHandler; 