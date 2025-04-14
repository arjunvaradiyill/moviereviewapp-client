import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Button, 
  CircularProgress, 
  Box, 
  Paper,
  Chip,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import MovieIcon from '@mui/icons-material/Movie';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from '../utils/axios';

// Enhanced styled components
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  position: 'relative',
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(1),
  display: 'inline-flex',
  alignItems: 'center',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '40px',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s ease',
  },
  '&:hover::after': {
    width: '100%',
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  }
}));

const MovieCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
    '& .movie-poster': {
      transform: 'scale(1.08)',
    },
    '& .movie-overlay': {
      opacity: 1,
    }
  }
}));

const PosterOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: theme.spacing(2),
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 2,
}));

const HeroGradient = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(8, 2),
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 75%)',
  borderRadius: theme.shape.borderRadius * 3,
  overflow: 'hidden',
  marginBottom: theme.spacing(8),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
    opacity: 0.5,
  }
}));

const FloatingIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' }
  },
  zIndex: 1,
  opacity: 0.8,
}));

const GradientButton = styled(Button)(({ theme, colorstart, colorend }) => ({
  background: `linear-gradient(135deg, ${colorstart || theme.palette.primary.main} 0%, ${colorend || theme.palette.primary.dark} 100%)`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const SectionDivider = styled(Box)(({ theme }) => ({
  height: theme.spacing(12),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    height: '1px',
    background: `linear-gradient(to right, transparent, ${alpha(theme.palette.divider, 0.5)}, transparent)`,
  }
}));

const RatingChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.warning.main, 0.2),
  color: theme.palette.warning.dark,
  fontWeight: 'bold',
  '& .MuiChip-icon': {
    color: theme.palette.warning.dark
  }
}));

const UpcomingBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: alpha(theme.palette.error.main, 0.8),
  color: theme.palette.common.white,
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
  borderRadius: theme.shape.borderRadius * 5,
  fontWeight: 'bold',
  fontSize: '0.75rem',
  zIndex: 2,
}));

const Home = () => {
  const theme = useTheme();
  const [latestMovies, setLatestMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to format the release date with month and year
  const formatReleaseDate = (month, year) => {
    if (!year) return '';
    
    if (!month) return year.toString();
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${monthNames[month - 1]} ${year}`;
  };

  // Fetch latest and upcoming movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        // Fetch latest movies
        const latestResponse = await axios.get('/movies?sort=-releaseYear&limit=8');
        setLatestMovies(latestResponse.data);
        
        // Fetch upcoming movies
        const upcomingResponse = await axios.get('/movies/upcoming');
        setUpcomingMovies(upcomingResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Please try again later.");
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 5 }}>
      {/* Enhanced Hero Section */}
      <HeroGradient>
        <FloatingIcon sx={{ top: '15%', right: '10%' }}>
          <MovieIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.4)' }} />
        </FloatingIcon>
        <FloatingIcon sx={{ top: '40%', right: '25%', animationDelay: '2s' }}>
          <StarIcon sx={{ fontSize: 30, color: 'rgba(255,255,255,0.3)' }} />
        </FloatingIcon>
        <FloatingIcon sx={{ bottom: '20%', right: '15%', animationDelay: '4s' }}>
          <StarIcon sx={{ fontSize: 25, color: 'rgba(255,255,255,0.3)' }} />
        </FloatingIcon>

        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: 800, mx: 'auto' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 900,
              background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              textShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}
          >
            IFB
          </Typography>
          <Typography 
            variant="h6" 
            color="white" 
            sx={{ 
              maxWidth: '700px', 
              mx: 'auto', 
              mb: 4,
              opacity: 0.9
            }}
          >
            Discover, review, and track your favorite movies all in one place
          </Typography>
        
          <GradientButton 
            component={Link} 
            to="/movies" 
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 8,
              fontSize: '1.1rem',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
            }}
          >
            Explore Movies
          </GradientButton>
        </Box>
      </HeroGradient>

      {/* Latest Movies Section */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <SectionTitle variant="h4">
            <TrendingUpIcon />
            Latest Movies
          </SectionTitle>
          <Button 
            component={Link} 
            to="/movies" 
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              fontWeight: 'bold',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '2px',
                backgroundColor: 'transparent',
                transition: 'background-color 0.3s ease',
              },
              '&:hover::after': {
                backgroundColor: theme.palette.primary.main,
              }
            }}
          >
            View All
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {latestMovies.map((movie) => (
            <Grid item xs={12} sm={6} md={3} key={movie._id}>
              <MovieCard>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Image'}
                    alt={movie.title}
                    className="movie-poster"
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  <PosterOverlay className="movie-overlay">
                    <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                      {movie.description?.substring(0, 80)}...
                    </Typography>
                    <GradientButton 
                      component={Link} 
                      to={`/movies/${movie._id}`} 
                      size="small" 
                      fullWidth 
                      sx={{ borderRadius: 8 }}
                    >
                      View Details
                    </GradientButton>
                  </PosterOverlay>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" noWrap sx={{ fontWeight: 'bold' }}>
                    {movie.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatReleaseDate(movie.releaseMonth, movie.releaseYear)}
                    </Typography>
                    {movie.averageRating > 0 && (
                      <RatingChip 
                        size="small" 
                        icon={<StarIcon />} 
                        label={movie.averageRating.toFixed(1)} 
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {movie.genre.slice(0, 2).map((genre, index) => (
                      <Chip 
                        key={index} 
                        label={genre} 
                        size="small" 
                        variant="outlined"
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            transform: 'translateY(-2px)'
                          }
                        }}
                      />
                    ))}
                    {movie.genre.length > 2 && (
                      <Chip label={`+${movie.genre.length - 2}`} size="small" variant="outlined" />
                    )}
                  </Box>
                </CardContent>
              </MovieCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      <SectionDivider />
      
      {/* Upcoming Movies Section */}
      {upcomingMovies.length > 0 && (
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <SectionTitle variant="h4">
              <NewReleasesIcon />
              Coming Soon
            </SectionTitle>
            <Button 
              component={Link} 
              to="/movies?sort=releaseYear" 
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                fontWeight: 'bold',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.3s ease',
                },
                '&:hover::after': {
                  backgroundColor: theme.palette.primary.main,
                }
              }}
            >
              View All
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {upcomingMovies.map((movie) => (
              <Grid item xs={12} sm={6} md={3} key={movie._id}>
                <MovieCard sx={{ position: 'relative' }}>
                  <UpcomingBadge>
                    {formatReleaseDate(movie.releaseMonth, movie.releaseYear)}
                  </UpcomingBadge>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="300"
                      image={movie.posterUrl || 'https://via.placeholder.com/300x450?text=Coming+Soon'}
                      alt={movie.title}
                      className="movie-poster"
                      sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        filter: 'brightness(0.9)',
                      }}
                    />
                    <PosterOverlay className="movie-overlay">
                      <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                        {movie.description?.substring(0, 80)}...
                      </Typography>
                      <GradientButton 
                        component={Link} 
                        to={`/movies/${movie._id}`} 
                        size="small" 
                        fullWidth 
                        sx={{ borderRadius: 8 }}
                        colorstart={theme.palette.secondary.light}
                        colorend={theme.palette.secondary.dark}
                      >
                        View Details
                      </GradientButton>
                    </PosterOverlay>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap sx={{ fontWeight: 'bold' }}>
                      {movie.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Director: {movie.director}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {movie.genre.slice(0, 2).map((genre, index) => (
                        <Chip 
                          key={index} 
                          label={genre} 
                          size="small" 
                          variant="outlined"
                          sx={{
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              transform: 'translateY(-2px)'
                            }
                          }}
                        />
                      ))}
                      {movie.genre.length > 2 && (
                        <Chip label={`+${movie.genre.length - 2}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                </MovieCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Home; 