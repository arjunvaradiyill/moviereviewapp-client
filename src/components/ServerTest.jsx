import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import axios from '../utils/axios';

const ServerTest = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log('Checking server connection...');
        const response = await axios.get('/api/test');
        console.log('Server response:', response.data);
        setStatus('success');
        setMessage(`Server is working! (${response.data.timestamp})`);
      } catch (error) {
        console.error('Server check failed:', error);
        setStatus('error');
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to connect to server';
        const statusCode = error.response?.status;
        const url = error.config?.url;
        setError(`${errorMessage}${statusCode ? ` (Status: ${statusCode})` : ''}${url ? ` (URL: ${url})` : ''}`);
      }
    };

    checkServer();
  }, []);

  return (
    <Box sx={{ 
      p: 2, 
      border: '1px solid #ccc', 
      borderRadius: 1, 
      mb: 2,
      bgcolor: 'background.paper',
      boxShadow: 1
    }}>
      <Typography variant="h6" gutterBottom>
        Server Connection Test
      </Typography>
      {status === 'checking' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Checking server connection...</Typography>
        </Box>
      )}
      {status === 'success' && (
        <Alert severity="success" sx={{ mt: 1 }}>
          {message}
        </Alert>
      )}
      {status === 'error' && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ServerTest; 