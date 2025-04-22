import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          py: 6, 
          px: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph align="center" sx={{ mb: 4, maxWidth: '600px' }}>
          We couldn't find the page you're looking for. The page may have been moved, 
          deleted, or is temporarily unavailable.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/"
            startIcon={<HomeIcon />}
          >
            Go to Home
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound; 