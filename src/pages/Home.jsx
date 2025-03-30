import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ServerTest from '../components/ServerTest';
import MovieIcon from '@mui/icons-material/Movie';
import RateReviewIcon from '@mui/icons-material/RateReview';
import GroupIcon from '@mui/icons-material/Group';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <MovieIcon sx={{ fontSize: 40 }} />,
      title: 'Browse Movies',
      description: 'Explore our extensive collection of movies from various genres and eras.'
    },
    {
      icon: <RateReviewIcon sx={{ fontSize: 40 }} />,
      title: 'Write Reviews',
      description: 'Share your thoughts and opinions about movies you\'ve watched.'
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      title: 'Join Community',
      description: 'Connect with other movie enthusiasts and discuss your favorite films.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Movie Review App
              </Typography>
              <Typography variant="h5" paragraph>
                Your personal space to discover, review, and discuss movies
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  component={RouterLink}
                  to="/movies"
                  variant="contained"
                  size="large"
                  sx={{ mr: 2, mb: isMobile ? 2 : 0 }}
                >
                  Browse Movies
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Get Started
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <ServerTest />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" gutterBottom>
              Ready to Start?
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Join our community of movie enthusiasts today
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
            >
              Create Account
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 