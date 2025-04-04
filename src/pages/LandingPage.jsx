import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import TheatersIcon from '@mui/icons-material/Theaters';
import StarIcon from '@mui/icons-material/Star';
import BookmarkIcon from '@mui/icons-material/Bookmark';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(125deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
  minHeight: '85vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  color: theme.palette.common.white,
  padding: theme.spacing(4, 0),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.15,
    zIndex: -1,
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    fontSize: 32,
  },
}));

const LandingPage = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <TheatersIcon />,
      title: 'Discover',
      description: 'Explore film collections'
    },
    {
      icon: <StarIcon />,
      title: 'Review',
      description: 'Share your perspective'
    },
    {
      icon: <BookmarkIcon />,
      title: 'Curate',
      description: 'Build your watchlist'
    }
  ];

  return (
    <HeroSection>
      <Container maxWidth="md">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="h1" 
                component="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  letterSpacing: '-0.02em',
                  mb: 3,
                  lineHeight: 1.1
                }}
              >
                Movie Review Hub
              </Typography>
              <Typography 
                variant="h5"
                sx={{
                  fontWeight: 300,
                  opacity: 0.9,
                  mb: 5,
                  lineHeight: 1.4,
                  maxWidth: '90%'
                }}
              >
                Discover, review, and discuss films
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="contained" 
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  Join
                </Button>
                <Button 
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    borderColor: alpha(theme.palette.common.white, 0.5),
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: theme.palette.common.white,
                      backgroundColor: alpha(theme.palette.common.white, 0.05),
                    }
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Box sx={{ 
              backgroundColor: alpha(theme.palette.background.paper, 0.05),
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              p: 3,
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
            }}>
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <FeatureIcon>
                        {feature.icon}
                      </FeatureIcon>
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </HeroSection>
  );
};

export default LandingPage; 