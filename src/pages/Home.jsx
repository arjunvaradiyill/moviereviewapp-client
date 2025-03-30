import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ServerTest from '../components/ServerTest';

const Home = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Movie Review App
        </Typography>
        <ServerTest />
        <Typography variant="body1" paragraph>
          Browse movies, read reviews, and share your thoughts with other movie enthusiasts.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 