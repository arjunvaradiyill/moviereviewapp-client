import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import axios from './axios';

const ConnectionErrorHandler = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await axios.get('/api/health');
        // Successfully connected
      } catch (error) {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
          setMessage('Cannot connect to API server. Make sure the server is running on port 8000. Run "cd server && npm run dev" in a separate terminal.');
        } else {
          setMessage('Cannot connect to the server. Please try again later. The server might be temporarily down or restarting.');
        }
        setOpen(true);
      }
    };

    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={10000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="error">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ConnectionErrorHandler; 