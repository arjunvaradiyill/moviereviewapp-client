import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: 8,
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to Movie Review
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        Share your thoughts about movies and discover new favorites
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          component={RouterLink}
          to="/movies"
          variant="contained"
          size="large"
          sx={{ mr: 2 }}
        >
          Browse Movies
        </Button>
        <Button
          component={RouterLink}
          to="/register"
          variant="outlined"
          size="large"
        >
          Get Started
        </Button>
      </Box>
    </Box>
  );
};

export default Home; 