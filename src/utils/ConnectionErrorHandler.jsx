import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Button } from '@mui/material';
import axios from './axios';

const ConnectionErrorHandler = () => {
  const [connectionError, setConnectionError] = useState(false);
  
  useEffect(() => {
    // Function to check server connection
    const checkConnection = async () => {
      try {
        await axios.get('/api/test');
        setConnectionError(false);
      } catch (error) {
        console.error('Server connection error:', error);
        setConnectionError(true);
      }
    };
    
    // Check connection on mount
    checkConnection();
    
    // Set up periodic connection checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const handleRetry = () => {
    window.location.reload();
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
        action={
          <Button color="inherit" size="small" onClick={handleRetry}>
            Retry
          </Button>
        }
      >
        Unable to connect to the server. Please check your connection.
      </Alert>
    </Snackbar>
  );
};

export default ConnectionErrorHandler; 