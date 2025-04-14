import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Button,
  Paper,
  useTheme,
  alpha,
  Slide,
  IconButton,
  LinearProgress
} from '@mui/material';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import HomeIcon from '@mui/icons-material/Home';

const LoginSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // Check if user is logged in, if not redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch movies with banners
    const fetchMoviesWithBanners = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/movies/with-banners');
        setMovies(response.data);
        setLoading(false);
        
        // Start the animation after movies are loaded
        setTimeout(() => {
          setStartAnimation(true);
        }, 500);
      } catch (err) {
        console.error('Error fetching movie banners:', err);
        setError('Failed to load movie banners');
        setLoading(false);
      }
    };

    fetchMoviesWithBanners();
  }, [user, navigate]);

  // Automatic slideshow
  useEffect(() => {
    let slideshowTimer;
    if (movies.length > 0 && !loading) {
      slideshowTimer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
      }, 7000);
    }

    return () => {
      if (slideshowTimer) clearInterval(slideshowTimer);
    };
  }, [movies, loading]);

  // Automatic redirect to home page
  useEffect(() => {
    let redirectTimer;
    let countdownTimer;

    if (!loading && movies.length > 0) {
      redirectTimer = setTimeout(() => {
        navigate('/home');
      }, timeLeft * 1000);

      countdownTimer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [loading, movies, navigate, timeLeft]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const handleGoToHome = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Preparing your movie experience...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button variant="contained" onClick={handleGoToHome} sx={{ mt: 2 }}>
            Go to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  if (movies.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="body1" gutterBottom>
          No featured movies available at the moment.
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleGoToHome}
          startIcon={<HomeIcon />}
          sx={{ mt: 2 }}
        >
          Continue to Home
        </Button>
      </Box>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Movie Banner Background */}
      <Slide direction="right" in={startAnimation} timeout={800}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${currentMovie?.bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
            transition: 'all 0.5s ease-in-out',
          }}
        />
      </Slide>

      {/* Overlay Gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          py: 4,
        }}
      >
        <Slide direction="up" in={startAnimation} timeout={1000}>
          <Box>
            <Typography 
              variant="h6" 
              color="primary" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Welcome back, {user?.username}!
            </Typography>
            
            <Typography 
              variant="h2" 
              color="white" 
              gutterBottom 
              sx={{ 
                fontWeight: 900,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                mb: 2,
                maxWidth: '70%',
              }}
            >
              {currentMovie?.title}
            </Typography>
            
            <Typography 
              variant="body1" 
              color="white" 
              sx={{ 
                maxWidth: '50%', 
                mb: 4,
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              {currentMovie?.description?.substring(0, 180)}...
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={() => navigate(`/movies/${currentMovie?._id}`)}
                sx={{
                  px: 3, 
                  py: 1,
                  borderRadius: 8,
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)',
                  boxShadow: '0 4px 12px rgba(245, 0, 87, 0.3)',
                }}
              >
                View Details
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleGoToHome}
                sx={{
                  px: 3,
                  py: 1,
                  color: 'white',
                  borderColor: 'white',
                  borderRadius: 8,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                Skip to Home
              </Button>
            </Box>
          </Box>
        </Slide>

        {/* Navigation Controls */}
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}
        >
          <IconButton 
            color="primary" 
            onClick={handlePrevious}
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.5)', 
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } 
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          
          {movies.map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: idx === currentIndex ? 'primary.main' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
              }}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
          
          <IconButton 
            color="primary" 
            onClick={handleNext}
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.5)', 
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } 
            }}
          >
            <NavigateNextIcon />
          </IconButton>
        </Box>
        
        {/* Countdown */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.6)',
            px: 2,
            py: 1,
            borderRadius: 16
          }}
        >
          <Typography variant="body2">
            Redirecting to Home in {timeLeft}s
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(timeLeft / 10) * 100}
            sx={{ 
              width: 60, 
              height: 6, 
              borderRadius: 3,
              '& .MuiLinearProgress-bar': {
                borderRadius: 3
              }
            }} 
          />
        </Box>
      </Container>
    </Box>
  );
};

export default LoginSuccess; 