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
  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
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

// Timeline styled components
const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: '4px',
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '4px',
    transform: 'translateX(-50%)',
  }
}));

const TimelineItem = styled(Box)(({ theme, align }) => ({
  position: 'relative',
  marginBottom: theme.spacing(8),
  width: '100%',
  display: 'flex',
  justifyContent: align === 'left' ? 'flex-start' : 'flex-end',
  [theme.breakpoints.down('md')]: {
    justifyContent: 'flex-end',
    paddingLeft: '40px',
  }
}));

const TimelineContent = styled(Box)(({ theme, align }) => ({
  width: '45%',
  position: 'relative',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
  [theme.breakpoints.down('md')]: {
    width: '90%',
  }
}));

const TimelineDot = styled(Box)(({ theme, align }) => ({
  position: 'absolute',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  top: '50%',
  left: align === 'left' ? 'calc(100% + 14px)' : 'auto',
  right: align === 'right' ? 'calc(100% + 14px)' : 'auto',
  transform: 'translateY(-50%)',
  zIndex: 2,
  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`,
  [theme.breakpoints.down('md')]: {
    left: '-30px',
    right: 'auto',
  }
}));

const TimelineDate = styled(Typography)(({ theme, align }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: align === 'left' ? 'auto' : 'calc(100% + 40px)',
  right: align === 'right' ? 'auto' : 'calc(100% + 40px)',
  color: theme.palette.text.secondary,
  fontWeight: 'bold',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  }
}));

const TimelineCard = styled(Card)(({ theme }) => ({
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  height: '100%',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[10],
  }
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

  // Helper to get a theme color based on the release date
  const getTimelineColor = (releaseMonth, releaseYear, theme) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Calculate how far in the future the movie is
    const monthsDiff = ((releaseYear - currentYear) * 12) + (releaseMonth - currentMonth);
    
    if (monthsDiff <= 1) return theme.palette.error.main; // Very soon - red
    if (monthsDiff <= 3) return theme.palette.warning.main; // Soon - orange
    if (monthsDiff <= 6) return theme.palette.info.main; // Medium term - blue
    return theme.palette.success.main; // Long term - green
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
            color="text.primary"
            align="center"
            sx={{
              fontWeight: '700',
              mb: 2,
              background: 'linear-gradient(45deg, #00796B 30%, #673AB7 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0px 4px 3px rgba(0,0,0,0.1)',
            }}
          >
            Welcome to MovieHub
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
                      sx={{ 
                        borderRadius: 8,
                        py: 1,
                        fontWeight: 'bold',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: '2px solid white',
                        '&:hover': {
                          backgroundColor: '#F57C00',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                        }
                      }}
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
      
      {/* Upcoming Movies Section with Timeline */}
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
          
          <TimelineContainer>
            {upcomingMovies.map((movie, index) => {
              const timelineColor = getTimelineColor(movie.releaseMonth, movie.releaseYear, theme);
              const isLeft = index % 2 === 0;
              
              return (
                <TimelineItem key={movie._id} align={isLeft ? 'left' : 'right'}>
                  <TimelineContent align={isLeft ? 'left' : 'right'}>
                    <TimelineDot 
                      align={isLeft ? 'left' : 'right'} 
                      sx={{ backgroundColor: timelineColor }}
                    />
                    <TimelineDate 
                      variant="subtitle1" 
                      align={isLeft ? 'left' : 'right'}
                    >
                      {formatReleaseDate(movie.releaseMonth, movie.releaseYear)}
                    </TimelineDate>
                    <TimelineCard>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                        <CardMedia
                          component="img"
                          sx={{ 
                            width: { xs: '100%', sm: '150px' }, 
                            height: { xs: '200px', sm: '100%' },
                            objectFit: 'cover'
                          }}
                          image={movie.posterUrl || 'https://via.placeholder.com/300x450?text=Coming+Soon'}
                          alt={movie.title}
                        />
                        <CardContent sx={{ flex: '1 0 auto', p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <Typography gutterBottom variant="h6" component="h2">
                            {movie.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {formatReleaseDate(movie.releaseMonth, movie.releaseYear)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {movie.genre.slice(0, 2).join(', ')}
                            {movie.genre.length > 2 && '...'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {movie.description?.substring(0, 100)}
                            {movie.description?.length > 100 ? '...' : ''}
                          </Typography>
                          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center' }}>
                          <Button 
                            component={Link} 
                            to={`/movies/${movie._id}`}
                            variant="contained"
                            size="small"
                            sx={{ 
                              backgroundColor: '#FF9800',
                              color: 'white',
                              fontWeight: 'bold',
                              minWidth: '120px',
                              '&:hover': {
                                backgroundColor: '#F57C00',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                              }
                            }}
                          >
                            View Details
                          </Button>
                          </Box>
                        </CardContent>
                      </Box>
                    </TimelineCard>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </TimelineContainer>
        </Box>
      )}
    </Container>
  );
};

export default Home; 