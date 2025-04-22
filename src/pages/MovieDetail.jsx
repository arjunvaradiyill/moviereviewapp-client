import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Rating,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  DialogContentText,
  Snackbar,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  Tooltip,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import ReactPlayer from 'react-player/youtube';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PauseIcon from '@mui/icons-material/Pause';

// Styled components for enhanced UI
const BannerOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(transparent, rgba(0,0,0,0.9) 70%)',
  padding: theme.spacing(5, 3, 4),
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  zIndex: 2,
  backdropFilter: 'blur(3px)'
}));

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.primary.main,
  },
  '& .MuiRating-iconHover': {
    color: theme.palette.primary.light,
  },
}));

const MovieBadge = styled(Box)(({ theme }) => ({
  display: 'flex', 
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  }
}));

const ReviewCard = styled(Paper)(({ theme, ishighlighted }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: ishighlighted === 'true' ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
  border: ishighlighted === 'true' ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  }
}));

// New styled components
const GlassCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const GradientButton = styled(Button)(({ theme, colorstart, colorend }) => ({
  background: `linear-gradient(135deg, ${colorstart || theme.palette.primary.main} 0%, ${colorend || theme.palette.primary.dark} 100%)`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '50%',
    background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
    zIndex: 1
  }
}));

// Add animation for star ratings
const AnimatedRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.primary.main,
    animation: 'pulse 1.5s infinite ease-in-out alternate',
  },
  '@keyframes pulse': {
    from: { transform: 'scale(1)', filter: 'brightness(1)' },
    to: { transform: 'scale(1.1)', filter: 'brightness(1.2)' }
  }
}));

// Add an animated badge for important info
const AnimatedBadge = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius * 5,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.common.white,
  fontWeight: 'bold',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
  animation: 'float 3s infinite ease-in-out alternate',
  '@keyframes float': {
    from: { transform: 'translateY(0px)' },
    to: { transform: 'translateY(-5px)' }
  }
}));

// Add a new component for a 3D poster effect
const Poster3D = styled(Box)(({ theme }) => ({
  position: 'relative',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'rotateY(5deg) rotateX(2deg)',
    '& .poster-shine': {
      opacity: 1,
    }
  },
}));

const PosterShine = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
  opacity: 0,
  transition: 'opacity 0.5s ease',
  pointerEvents: 'none',
  zIndex: 3,
}));

// Add a scrolling movie facts ticker
const FactsTicker = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  backdropFilter: 'blur(5px)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.divider, 0.1)}`,
  height: '50px',
  display: 'flex',
  alignItems: 'center',
}));

const TickerContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  animation: 'ticker-scroll 20s linear infinite',
  whiteSpace: 'nowrap',
  '&:hover': {
    animationPlayState: 'paused',
  },
  '@keyframes ticker-scroll': {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(-100%)' },
  }
}));

const FactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  borderRadius: theme.shape.borderRadius * 4,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
    fontSize: '1.2rem',
  }
}));

// Add a style for the movie title in the hero
const MovieTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
  marginBottom: theme.spacing(2),
  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
  lineHeight: 1.1,
}));

// Style for genre badges in hero
const GenreBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha('#fff', 0.2),
  color: 'white',
  backdropFilter: 'blur(4px)',
  transition: 'all 0.2s ease-in-out',
  margin: theme.spacing(0.5),
  '&:hover': { 
    backgroundColor: alpha('#fff', 0.3),
    transform: 'translateY(-2px)'
  },
}));

// Add a styled component for the video player wrapper
const VideoPlayerWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  '& iframe, & video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  '& .react-player__preview': {
    backgroundSize: 'cover',
  }
}));

// Add a component for video controls
const VideoControls = ({ isPlaying, isMuted, onPlayPause, onMute }) => (
  <Box sx={{ 
    position: 'absolute', 
    bottom: 20, 
    left: 0, 
    right: 0, 
    display: 'flex', 
    justifyContent: 'space-between',
    px: 3,
    alignItems: 'center',
    zIndex: 3
  }}>
    <IconButton 
      onClick={onPlayPause} 
      sx={{ 
        color: 'white', 
        bgcolor: 'rgba(0,0,0,0.6)', 
        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } 
      }}
    >
      {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
    </IconButton>
    
    <IconButton 
      onClick={onMute} 
      sx={{ 
        color: 'white', 
        bgcolor: 'rgba(0,0,0,0.6)', 
        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } 
      }}
    >
      {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
    </IconButton>
  </Box>
);

// Helper to extract YouTube video ID from URL
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
  });
  const [reviewError, setReviewError] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trailerDialogOpen, setTrailerDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingReview, setEditingReview] = useState({
    rating: 0,
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const fetchMovieDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/movies/${id}`);
      setMovie(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movie:', error);
      setError(error.response?.data?.message || 'Failed to load movie details');
      setLoading(false);
    }
  }, [id, setError]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`/reviews/movie/${id}`);
      if (response.data) {
        setReviews(response.data);
        if (user) {
          const userReview = response.data.find(review => review.user._id === user._id);
          setHasReviewed(!!userReview);
          if (userReview) {
            setEditingReview({
              rating: userReview.rating,
              comment: userReview.comment,
            });
            setNewReview({
              rating: userReview.rating,
              comment: userReview.comment,
            });
          } else {
            setNewReview({
              rating: 0,
              comment: '',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (error.response) {
        setError(error.response.data.message || 'Failed to load reviews');
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error setting up the request. Please try again.');
      }
    }
  }, [id, user]);

  const checkWatchlistStatus = useCallback(async () => {
    if (!user || !id) return;
    
    try {
      setWatchlistLoading(true);
      const response = await axios.get('/users/me/watchlist');
      const isInWatchlist = response.data.some(movie => movie._id === id);
      setInWatchlist(isInWatchlist);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
      // Don't set an error, just assume it's not in watchlist
      setInWatchlist(false);
    } finally {
      setWatchlistLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
    checkWatchlistStatus();
  }, [fetchMovieDetails, fetchReviews, checkWatchlistStatus]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    // Validate rating
    if (!newReview.rating || newReview.rating < 1 || newReview.rating > 5) {
      setReviewError('Please select a rating between 1 and 5');
      return;
    }

    // Validate comment
    if (!newReview.comment.trim()) {
      setReviewError('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      // If user has already reviewed, update the existing review
      if (hasReviewed) {
        // Find the user's existing review
        const existingReview = reviews.find(review => review.user._id === user._id);
        
        if (existingReview) {
          response = await axios.put(`/reviews/${existingReview._id}`, {
            rating: newReview.rating,
            comment: newReview.comment.trim()
          });
          
          // Update the reviews list with the updated review
          setReviews(reviews.map(review => 
            review._id === existingReview._id ? response.data : review
          ));
          
          setSnackbar({
            open: true,
            message: 'Review updated successfully!',
            severity: 'success'
          });
        }
      } else {
        // Create a new review
        response = await axios.post('/reviews', {
          movieId: movie._id,
          rating: newReview.rating,
          comment: newReview.comment.trim()
        });
        
        // Add the new review to the list
        setReviews([response.data, ...reviews]);
        setHasReviewed(true);
        
        setSnackbar({
          open: true,
          message: 'Review submitted successfully!',
          severity: 'success'
        });
      }
      
      // Reset form after creating a new review (but keep values after updating)
      if (!hasReviewed) {
        setNewReview({ rating: 0, comment: '' });
      }
      
      // Update movie data
      if (response?.data?.movie) {
        setMovie(prev => ({
          ...prev,
          averageRating: response.data.movie.averageRating,
          totalReviews: response.data.movie.totalReviews
        }));
      } else {
        // Refetch movie details to get updated ratings
        fetchMovieDetails();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      setReviewError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = async () => {
    setIsEditing(true);
    try {
      const rating = Number(editingReview.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        setReviewError('Rating must be between 1 and 5');
        return;
      }

      if (!editingReview.comment.trim()) {
        setReviewError('Comment cannot be empty');
        return;
      }

      const response = await axios.put(`/reviews/${selectedReview._id}`, {
        rating: rating,
        comment: editingReview.comment.trim(),
      });

      if (response.data) {
        setEditDialogOpen(false);
        setReviewError('');
        fetchReviews();
        fetchMovieDetails();
        setSnackbar({
          open: true,
          message: 'Review updated successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setReviewError(error.response?.data?.message || 'Failed to update review');
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update review',
        severity: 'error'
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteReview = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/reviews/${selectedReview._id}`);
      setDeleteDialogOpen(false);
      setHasReviewed(false);
      
      // Reset review form state
      setNewReview({ rating: 0, comment: '' });
      
      // Remove the deleted review from the reviews list
      setReviews(reviews.filter(review => review._id !== selectedReview._id));
      
      // Refetch movie details to update average rating
      fetchMovieDetails();
      
      setSnackbar({
        open: true,
        message: 'Review deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      setReviewError(error.response?.data?.message || 'Failed to delete review');
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete review',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleWatchlistAction = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        // Remove from watchlist
        await axios.delete(`/users/me/watchlist/${id}`);
        setInWatchlist(false);
        setSnackbar({
          open: true,
          message: 'Removed from your watchlist',
          severity: 'success'
        });
      } else {
        // Add to watchlist
        await axios.post(`/users/me/watchlist/${id}`);
        setInWatchlist(true);
        setSnackbar({
          open: true,
          message: 'Added to your watchlist',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update watchlist',
        severity: 'error'
      });
    } finally {
      setWatchlistLoading(false);
    }
  };

  const openEditDialog = (review) => {
    setSelectedReview(review);
    setEditingReview({
      rating: review.rating,
      comment: review.comment,
    });
    
    // Also update the newReview state so the form reflects the current review
    setNewReview({
      rating: review.rating,
      comment: review.comment,
    });
    
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  // Handle opening the trailer dialog
  const handleOpenTrailer = () => {
    setTrailerDialogOpen(true);
  };

  // Handle closing the trailer dialog
  const handleCloseTrailer = () => {
    setTrailerDialogOpen(false);
  };

  // Helper to format the release year
  const formatReleaseYear = (year) => {
    if (!year) return '';
    return year.toString();
  };

  // Helper to format the release date with month and year
  const formatReleaseDate = (month, year) => {
    if (!year) return '';
    
    if (!month) return formatReleaseYear(year);
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${monthNames[month - 1]} ${year}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 4 }}>
          Movie not found
        </Alert>
      </Container>
    );
  }

  return (
    <>
      {/* Hero Section with Banner or Trailer */}
      <HeroSection>
        {movie.bannerUrl || movie.trailerUrl ? (
          <Box
            sx={{
              position: 'relative',
              height: { xs: '400px', sm: '500px', md: '700px' },
              overflow: 'hidden',
            }}
          >
            {/* Show video player if trailer is available */}
            {movie.trailerUrl && getYoutubeVideoId(movie.trailerUrl) ? (
              <>
                <VideoPlayerWrapper>
                  <ReactPlayer
                    url={`https://www.youtube.com/watch?v=${getYoutubeVideoId(movie.trailerUrl)}`}
                    width="100%"
                    height="100%"
                    playing={true}
                    muted={true}
                    loop={true}
                    config={{
                      youtube: {
                        playerVars: {
                          controls: 0,
                          showinfo: 0,
                          rel: 0,
                          modestbranding: 1,
                        }
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                </VideoPlayerWrapper>
                
                {/* Video controls */}
                <VideoControls isPlaying={true} isMuted={true} onPlayPause={() => {}} onMute={() => {}} />
                
                {/* Fallback banner image while video loads or if paused */}
                <Box
                  component="img"
                  src={movie.bannerUrl}
                  alt={`${movie.title} banner`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    filter: 'brightness(0.65)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                />
              </>
            ) : (
              /* Regular banner image if no trailer */
              <Box
                component="img"
                src={movie.bannerUrl}
                alt={`${movie.title} banner`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  filter: 'brightness(0.65)',
                  transition: 'transform 10s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              />
            )}
            <BannerOverlay>
              <Box sx={{ maxWidth: '70%' }}>
                <MovieTitle variant="h1" color="white">
                  {movie.title}
                </MovieTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AnimatedRating 
                    value={movie.averageRating} 
                    readOnly 
                    precision={0.5} 
                    size="large"
                    icon={<StarIcon fontSize="inherit" sx={{ color: 'gold' }} />}
                    emptyIcon={<StarIcon fontSize="inherit" sx={{ color: 'rgba(255,255,255,0.3)' }} />}
                  />
                  <Typography variant="h6" color="white" sx={{ ml: 1, fontWeight: 'medium' }}>
                    {movie.averageRating ? movie.averageRating.toFixed(1) : 'No ratings'} 
                    {movie.totalReviews > 0 && ` (${movie.totalReviews} reviews)`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2, ml: -0.5 }}>
                  {movie.genre.map(genre => (
                    <GenreBadge 
                      key={genre} 
                      label={genre} 
                      size="medium" 
                    />
                  ))}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignSelf: 'flex-end', zIndex: 10 }}>
                <Stack 
                  direction="row" 
                  spacing={2} 
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleOpenTrailer}
                    sx={{ 
                      borderRadius: 2,
                      px: 3
                    }}
                  >
                    Watch Trailer
                  </Button>
                </Stack>
                
                <GradientButton
                  startIcon={inWatchlist ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />}
                  variant="contained"
                  color="primary"
                  onClick={handleWatchlistAction}
                  disabled={watchlistLoading || !user}
                  size="large"
                  sx={{
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.5,
                    borderRadius: 8,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {watchlistLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : inWatchlist ? (
                    isMobile ? "Remove" : "Remove from Watchlist"
                  ) : (
                    isMobile ? "Watchlist" : "Add to Watchlist"
                  )}
                </GradientButton>
              </Box>
            </BannerOverlay>
          </Box>
        ) : (
          <Box sx={{ 
            backgroundColor: theme.palette.primary.dark, 
            height: { xs: '200px', sm: '250px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4
          }}>
            <LocalMoviesIcon sx={{ fontSize: 100, color: alpha('#fff', 0.2), mb: 2 }} />
          </Box>
        )}
      </HeroSection>

      {/* Add a scroll indicator for long pages */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 40, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 10,
          opacity: 0.7,
          animation: 'fadeInOut 2s infinite ease-in-out',
          '@keyframes fadeInOut': {
            '0%, 100%': { opacity: 0.2 },
            '50%': { opacity: 0.7 }
          },
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '0.75rem'
          }}
        >
          Scroll for more
          <Box 
            component="span" 
            sx={{ 
              display: 'block', 
              width: '20px', 
              height: '20px', 
              borderLeft: '2px solid',
              borderBottom: '2px solid', 
              transform: 'rotate(-45deg)',
              mt: 0.5
            }}
          />
        </Typography>
      </Box>

      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: movie.bannerUrl ? 4 : { xs: -6, sm: -8, md: -10 },
          position: 'relative',
          zIndex: 2,
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        {/* Movie Header (for non-banner view) */}
        {!movie.bannerUrl && (
          <GlassCard sx={{ mb: 4, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {movie.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StyledRating value={movie.averageRating} readOnly precision={0.5} />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {movie.averageRating ? movie.averageRating.toFixed(1) : 'Not rated'} 
                    {movie.totalReviews > 0 && ` (${movie.totalReviews} ${movie.totalReviews === 1 ? 'review' : 'reviews'})`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {movie.genre.map(genre => (
                    <Chip key={genre} label={genre} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
                <GradientButton
                  variant="contained"
                  colorstart="#e50914"
                  colorend="#b71c1c"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleOpenTrailer}
                  size={isMobile ? "small" : "medium"}
                >
                  {isMobile ? "Trailer" : "Watch Trailer"}
                </GradientButton>
                {user && (
                  <GradientButton
                    variant="contained"
                    colorstart={inWatchlist ? theme.palette.secondary.light : theme.palette.primary.light}
                    colorend={inWatchlist ? theme.palette.secondary.dark : theme.palette.primary.dark}
                    startIcon={inWatchlist ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />}
                    onClick={handleWatchlistAction}
                    disabled={watchlistLoading}
                  >
                    {watchlistLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : inWatchlist ? (
                      isMobile ? "Remove" : "Remove from Watchlist"
                    ) : (
                      isMobile ? "Watchlist" : "Add to Watchlist"
                    )}
                  </GradientButton>
                )}
              </Box>
            </Box>
          </GlassCard>
        )}

        {/* Movie Content */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="flex-start">
          {/* Movie Poster and Info */}
          <Grid item xs={12} md={4} lg={3} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              position: 'sticky', 
              top: 80,
              width: '100%',
              height: '100%'
            }}>
              <Poster3D sx={{ width: '100%', maxWidth: { xs: '300px', md: '100%' }, mx: 'auto', display: 'block' }}>
                <Paper 
                  elevation={5} 
                  sx={{ 
                    overflow: 'hidden', 
                    borderRadius: 4,
                    mb: 3,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                    width: '100%'
                  }}
                >
                  <Box
                    component="img"
                    src={movie.posterUrl}
                    alt={movie.title}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                  <PosterShine className="poster-shine" />
                </Paper>
              </Poster3D>

              {/* Movie Facts Ticker */}
              <FactsTicker sx={{ width: '100%', maxWidth: { xs: '300px', md: '100%' }, mx: 'auto' }}>
                <TickerContent>
                  <FactItem>
                    <PersonIcon />
                    <Typography variant="body2">Director: {movie.director}</Typography>
                  </FactItem>
                  <FactItem>
                    <CategoryIcon />
                    <Typography variant="body2">Genres: {movie.genre.join(', ')}</Typography>
                  </FactItem>
                  <FactItem>
                    <StarIcon />
                    <Typography variant="body2">Rating: {movie.averageRating ? movie.averageRating.toFixed(1) : 'N/A'}</Typography>
                  </FactItem>
                  <FactItem>
                    <LocalMoviesIcon />
                    <Typography variant="body2">Released: {formatReleaseDate(movie.releaseMonth, movie.releaseYear)}</Typography>
                  </FactItem>
                </TickerContent>
              </FactsTicker>

              <GlassCard sx={{ mb: 3, mt: 3, maxWidth: { xs: '300px', md: '100%' }, mx: 'auto' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 'bold', 
                    borderBottom: `2px solid ${theme.palette.primary.main}`, 
                    pb: 1, 
                    display: 'flex', 
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: '4px',
                      height: '18px',
                      background: theme.palette.primary.main,
                      marginRight: theme.spacing(1),
                      borderRadius: '2px'
                    }
                  }}>
                    Movie Details
                  </Typography>
                  
                  {/* Add viewing indicator if appropriate */}
                  {(() => {
                    const currentDate = new Date();
                    const currentYear = currentDate.getFullYear();
                    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
                    
                    // Show Coming Soon badge if:
                    // 1. Movie is in a future year OR
                    // 2. Movie is in current year but future month
                    const isComingSoon = 
                      (movie.releaseYear > currentYear) || 
                      (movie.releaseYear === currentYear && movie.releaseMonth > currentMonth);
                    
                    return isComingSoon && (
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <AnimatedBadge>
                          <NewReleasesIcon fontSize="small" />
                          Coming Soon
                        </AnimatedBadge>
                      </Box>
                    );
                  })()}
                  
                  <MovieBadge>
                    <PersonIcon />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Director</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{movie.director}</Typography>
                    </Box>
                  </MovieBadge>
                  
                  <MovieBadge>
                    <CategoryIcon />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Genre</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{movie.genre.join(', ')}</Typography>
                    </Box>
                  </MovieBadge>
                  
                  <MovieBadge>
                    <LocalMoviesIcon />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Release Date</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {formatReleaseDate(movie.releaseMonth, movie.releaseYear)}
                      </Typography>
                    </Box>
                  </MovieBadge>
                  
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 'bold', 
                    mt: 3, 
                    mb: 1, 
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '40px',
                      height: '3px',
                      background: theme.palette.primary.main,
                      borderRadius: '2px'
                    }
                  }}>
                    Cast
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {movie.cast && movie.cast.map((actor, index) => (
                      <Chip
                        key={index}
                        avatar={
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            {typeof actor === 'string' && actor.length > 0 ? actor.charAt(0) : '?'}
                          </Avatar>
                        }
                        label={actor || 'Unknown'}
                        variant="outlined"
                        sx={{ mb: 1, transition: 'all 0.2s ease', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </GlassCard>

              {/* Add quick action links */}
              <GlassCard sx={{ mb: 3, overflow: 'hidden', maxWidth: { xs: '300px', md: '100%' }, mx: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Button 
                    startIcon={<StarIcon />} 
                    fullWidth 
                    sx={{ 
                      py: 2, 
                      borderRadius: 0,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                    onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Write a Review
                  </Button>
                  {user && (
                    <Button 
                      startIcon={inWatchlist ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />} 
                      fullWidth 
                      sx={{ 
                        py: 2, 
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08)
                        }
                      }}
                      onClick={handleWatchlistAction}
                    >
                      {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    </Button>
                  )}
                </Box>
              </GlassCard>
            </Box>
          </Grid>
          
          {/* Movie Description and Reviews */}
          <Grid item xs={12} md={8} lg={9}>
            <GlassCard sx={{ mb: 4 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 'bold', 
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  pl: 2,
                  pb: 0.5 
                }}>
                  Synopsis
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mt: 2, fontSize: '1.05rem' }}>
                  {movie.description}
                </Typography>
              </CardContent>
            </GlassCard>
            
            {/* Review Form */}
            <GlassCard sx={{ mb: 4 }} id="review-form">
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 'bold', 
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  pl: 2,
                  pb: 0.5 
                }}>
                  {hasReviewed ? 'Your Review' : 'Write a Review'}
                </Typography>
                
                {!user ? (
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    Please <Button color="primary" onClick={() => navigate('/login')}>login</Button> to write a review.
                  </Alert>
                ) : reviewError ? (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {reviewError}
                  </Alert>
                ) : (
                  <>
                    {hasReviewed && (
                      <Box>
                        {reviews.map((review) => (
                          review.user._id === user._id && (
                            <Box key={review._id} sx={{ 
                              mb: 3, 
                              p: 3, 
                              bgcolor: alpha(theme.palette.primary.main, 0.05), 
                              borderRadius: 2,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Box>
                                  <StyledRating value={review.rating} readOnly size="medium" sx={{ mb: 1 }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Last updated: {new Date(review.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Tooltip title="Edit Review">
                                    <IconButton
                                      color="primary"
                                      onClick={() => openEditDialog(review)}
                                      sx={{ mr: 1 }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Review">
                                    <IconButton
                                      color="error"
                                      onClick={() => openDeleteDialog(review)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                              <Typography variant="body1">
                                {review.comment}
                              </Typography>
                            </Box>
                          )
                        ))}
                        
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
                          Update Your Review
                        </Typography>
                      </Box>
                    )}
                    
                    <Box component="form" onSubmit={handleSubmitReview}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <StyledRating
                          name="rating"
                          value={newReview.rating}
                          onChange={(event, newValue) => {
                            setNewReview({ ...newReview, rating: newValue });
                          }}
                          size="large"
                        />
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                          {newReview.rating ? `${newReview.rating} stars` : 'Select rating'}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Your Review"
                        placeholder="Share your thoughts about this movie..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: '1px',
                            },
                          },
                        }}
                        required
                      />
                      <GradientButton
                        type="submit"
                        variant="contained"
                        disabled={!newReview.rating || !newReview.comment || isSubmitting}
                        sx={{ mt: 1, px: 4, py: 1.5, borderRadius: 8 }}
                      >
                        {isSubmitting ? <CircularProgress size={24} /> : hasReviewed ? 'Update Review' : 'Submit Review'}
                      </GradientButton>
                    </Box>
                  </>
                )}
              </CardContent>
            </GlassCard>

            {/* Reviews List */}
            <GlassCard>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 'bold', 
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  pl: 2,
                  pb: 0.5 
                }}>
                  All Reviews {reviews.length > 0 && `(${reviews.length})`}
                </Typography>
                
                {reviews.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                    <LocalMoviesIcon sx={{ fontSize: 70, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                    <Typography color="text.secondary" variant="h6" sx={{ mb: 1, fontWeight: 'medium' }}>No reviews yet</Typography>
                    <Typography color="text.secondary">Be the first to share your thoughts about this movie!</Typography>
                  </Box>
                ) : (
                  <Box sx={{ mt: 3 }}>
                    {reviews.map((review) => (
                      // Skip the user's own review since it's already shown above
                      review.user._id !== user?._id && (
                        <ReviewCard key={review._id} elevation={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 48, height: 48 }}>
                                {review.user && review.user.username && typeof review.user.username === 'string' 
                                  ? review.user.username.charAt(0).toUpperCase() 
                                  : '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {review.user && review.user.username ? review.user.username : 'Anonymous'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            {user && user.role === 'admin' && (
                              <Tooltip title="Delete Review (Admin)">
                                <IconButton
                                  color="error"
                                  onClick={() => openDeleteDialog(review)}
                                  size="small"
                                  sx={{ '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <StyledRating value={review.rating} readOnly size="small" />
                          </Box>
                          
                          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                            {review.comment}
                          </Typography>
                        </ReviewCard>
                      )
                    ))}
                  </Box>
                )}
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
        
        {/* Edit Review Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Edit Your Review</Typography>
          </DialogTitle>
          <DialogContent>
            {reviewError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {reviewError}
              </Alert>
            )}
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Rating</Typography>
              <StyledRating
                value={editingReview.rating}
                onChange={(event, newValue) => {
                  setEditingReview({ ...editingReview, rating: newValue });
                }}
                size="large"
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Review"
                value={editingReview.comment}
                onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                margin="normal"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setEditDialogOpen(false)} 
              disabled={isEditing}
              variant="outlined"
              sx={{ borderRadius: 8 }}
            >
              Cancel
            </Button>
            <GradientButton 
              onClick={handleEditReview} 
              variant="contained" 
              disabled={isEditing}
              sx={{ borderRadius: 8 }}
            >
              {isEditing ? <CircularProgress size={24} /> : 'Save Changes'}
            </GradientButton>
          </DialogActions>
        </Dialog>

        {/* Delete Review Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Delete Review</Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={isDeleting}
              variant="outlined"
              sx={{ borderRadius: 8 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteReview} 
              color="error" 
              variant="contained" 
              disabled={isDeleting}
              sx={{ borderRadius: 8 }}
            >
              {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Trailer Dialog - full-screen trailer view */}
        <Dialog
          open={trailerDialogOpen}
          onClose={handleCloseTrailer}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 3,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.primary.dark, color: 'white' }}>
            <Typography variant="h6">{movie.title} - Trailer</Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseTrailer}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {getYoutubeVideoId(movie.trailerUrl) ? (
              <Box
                sx={{
                  position: 'relative',
                  paddingBottom: '56.25%', /* 16:9 aspect ratio */
                  height: 0,
                  overflow: 'hidden',
                }}
              >
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${getYoutubeVideoId(movie.trailerUrl)}`}
                  width="100%"
                  height="100%"
                  controls={true}
                  playing={true}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <LocalMoviesIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                <Typography variant="body1">
                  Sorry, the trailer cannot be played. The URL might be invalid.
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default MovieDetail; 