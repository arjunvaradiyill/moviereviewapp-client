import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Button, CircularProgress, Box, Typography, LinearProgress } from '@mui/material';
import axios from './axios';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ConnectionErrorHandler = () => {
  const [connectionError, setConnectionError] = useState(false);
  const [errorType, setErrorType] = useState('');
  const [checking, setChecking] = useState(false);
  const [coldStarting, setColdStarting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [devServerMessage, setDevServerMessage] = useState('');
  
  // Check if we're in development environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';
  
  // Handle cold start detection
  useEffect(() => {
    let progressTimer;
    
    if (coldStarting) {
      setProgress(0);
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prev + 2; // Slowly increment progress (50 seconds to 100%)
        });
      }, 1000);
    } else {
      clearInterval(progressTimer);
    }
    
    return () => clearInterval(progressTimer);
  }, [coldStarting]);
  
  useEffect(() => {
    // Function to check server connection
    const checkConnection = async () => {
      if (checking) return;
      
      setChecking(true);
      try {
        // Use a smaller endpoint to check connection
        await axios.get('/api/movies?limit=1', { 
          timeout: 10000,
          retry: true,
          maxRetries: 2
        });
        setConnectionError(false);
        setErrorType('');
        setColdStarting(false);
        setRetryCount(0);
        setDevServerMessage('');
      } catch (error) {
        console.error('Server connection error:', error);
        setConnectionError(true);
        
        // Special case for development environment
        if (isDevelopment && isLocalhost) {
          setErrorType('development');
          setDevServerMessage('Make sure your API server is running on port 8000 (npm run server). The React client runs on port 3000 but connects to the API on port 8000.');
          setColdStarting(false);
          return;
        }
        
        // Detect cold start scenario (timeout + retry pattern)
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
          if (retryCount >= 1) {
            setColdStarting(true);
            setErrorType('coldstart');
          } else {
            setErrorType('timeout');
          }
        } else if (error.message === 'Network Error') {
          setErrorType('network');
          setColdStarting(false);
        } else {
          setErrorType('server');
          setColdStarting(false);
        }
      } finally {
        setChecking(false);
      }
    };
    
    // Check connection on mount
    checkConnection();
    
    // Set up periodic connection checks
    const interval = setInterval(() => {
      // More frequent checks during cold start
      if (coldStarting && !checking) {
        checkConnection();
      }
    }, coldStarting ? 10000 : 30000); // Check every 10s during cold start or 30s normally
    
    // Add global axios error listener to detect new issues
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // If it's a timeout or network error, update the state
        if (
          (error.code === 'ECONNABORTED' && error.message.includes('timeout')) ||
          error.message === 'Network Error'
        ) {
          // Only trigger connection check if we haven't already identified a problem
          if (!connectionError) {
            checkConnection();
          }
        }
        return Promise.reject(error);
      }
    );
    
    // Clean up
    return () => {
      clearInterval(interval);
      axios.interceptors.response.eject(interceptor);
    };
  }, [checking, connectionError, coldStarting, retryCount, isDevelopment, isLocalhost]);
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setConnectionError(false);
    
    // If we're in a cold start situation and have retried several times,
    // don't reload the page, just re-check the connection
    if (errorType === 'coldstart' || retryCount > 1) {
      // Just trigger a connection check
      setChecking(true);
      axios.get('/api/movies?limit=1', { 
        timeout: 10000,
        retry: true 
      })
        .then(() => {
          setConnectionError(false);
          setColdStarting(false);
          setRetryCount(0);
          // Only reload if we're no longer in cold start
          window.location.reload();
        })
        .catch(() => {
          setConnectionError(true);
          setChecking(false);
        });
    } else {
      window.location.reload();
    }
  };
  
  const getErrorMessage = () => {
    switch (errorType) {
      case 'development':
        return 'API connection error in development mode.';
      case 'coldstart':
        return 'The server is starting up. This may take up to a minute...';
      case 'timeout':
        return 'Request timed out. The server is taking too long to respond.';
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection.';
      case 'server':
      default:
        return 'Server error. Please try again later.';
    }
  };
  
  const getErrorIcon = () => {
    switch (errorType) {
      case 'development':
        return <ErrorOutlineIcon />;
      case 'coldstart':
        return <AccessTimeIcon />;
      case 'network':
        return <WifiOffIcon />;
      default:
        return <ErrorOutlineIcon />;
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
        severity={errorType === 'coldstart' ? 'info' : errorType === 'development' ? 'warning' : 'error'} 
        variant="filled"
        icon={getErrorIcon()}
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
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: '280px'
          }
        }}
      >
        <Typography variant="body2">{getErrorMessage()}</Typography>
        {devServerMessage && (
          <Typography variant="caption" sx={{ mt: 1, fontSize: '0.7rem' }}>
            {devServerMessage}
          </Typography>
        )}
        {errorType === 'coldstart' && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
};

export default ConnectionErrorHandler; 