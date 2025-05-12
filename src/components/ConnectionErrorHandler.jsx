import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Button, Box, Typography } from '@mui/material';
import { checkServerAvailability } from '../utils/axios';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Determine if we're running locally
const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

const ConnectionErrorHandler = () => {
  const [connectionError, setConnectionError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState('');

  const checkConnection = async () => {
    try {
      const isAvailable = await checkServerAvailability();
      setConnectionError(!isAvailable);
      if (!isAvailable) {
        setSnackbarOpen(true);
        if (isLocalhost) {
          setMessage('Cannot connect to API server. Make sure the server is running on port 8002. Run "cd server && npm run dev" in a separate terminal.');
        } else {
          setMessage('Cannot connect to the server. Please try again later. The server might be temporarily down or restarting.');
        }
      }
    } catch (error) {
      console.error('Connection check error:', error);
      setConnectionError(true);
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    // Check connection on component mount
    checkConnection();

    // Set up interval for periodic checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      {connectionError && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            p: 1,
            bgcolor: 'error.main',
            color: 'error.contrastText',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ErrorOutlineIcon sx={{ mr: 1 }} />
          <Typography variant="body2" component="span">
            {message}
          </Typography>
          <Button
            color="inherit"
            size="small"
            variant="outlined"
            sx={{ ml: 2, borderColor: 'white', fontSize: '0.7rem' }}
            onClick={checkConnection}
          >
            Retry
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={60000} // Show for 1 minute
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          variant="filled"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                checkConnection();
                setSnackbarOpen(false);
              }}
            >
              Retry
            </Button>
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConnectionErrorHandler; 