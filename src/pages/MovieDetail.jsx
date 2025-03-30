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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const fetchMovieDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/api/movies/${id}`);
      setMovie(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movie:', error);
      setError(error.response?.data?.message || 'Failed to load movie details');
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`/api/reviews/movie/${id}`);
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

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
  }, [fetchMovieDetails, fetchReviews]);

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
      const response = await axios.post('/api/reviews', {
        movieId: movie._id,
        rating: newReview.rating,
        comment: newReview.comment.trim()
      });
      
      // Update reviews list
      setReviews([response.data, ...reviews]);
      
      // Reset form
      setNewReview({ rating: 5, comment: '' });
      setHasReviewed(true);
      
      // Update movie data
      if (response.data && response.data.movie) {
        setMovie(prev => ({
          ...prev,
          averageRating: response.data.movie.averageRating,
          totalReviews: response.data.movie.totalReviews
        }));
      }
      
      setSnackbar({
        open: true,
        message: 'Review submitted successfully!',
        severity: 'success'
      });
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

      const response = await axios.put(`/api/reviews/${selectedReview._id}`, {
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
      await axios.delete(`/api/reviews/${selectedReview._id}`);
      setDeleteDialogOpen(false);
      setHasReviewed(false);
      fetchReviews();
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

  const openEditDialog = (review) => {
    setSelectedReview(review);
    setEditingReview({
      rating: review.rating,
      comment: review.comment,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          Movie not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={4}>
        {/* Movie Details */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {movie.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Directed by {movie.director}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {movie.releaseYear} • {movie.genre.join(', ')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating 
                value={movie?.averageRating || 0} 
                precision={0.1} 
                readOnly 
                size="large"
                sx={{ 
                  '& .MuiRating-iconFilled': {
                    color: 'primary.main',
                  },
                  '& .MuiRating-iconHover': {
                    color: 'primary.main',
                  },
                }}
              />
              <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                {movie?.averageRating ? movie.averageRating.toFixed(1) : '0.0'} ({movie?.totalReviews || 0} reviews)
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              {movie.description}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Cast:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {movie.cast.join(', ')}
            </Typography>
          </Paper>
        </Grid>

        {/* Review Form */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Write a Review
            </Typography>
            {!user ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Please <Button color="primary" onClick={() => navigate('/login')}>login</Button> to write a review.
              </Alert>
            ) : reviewError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {reviewError}
              </Alert>
            ) : hasReviewed ? (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  You have already reviewed this movie. You can edit or delete your review below.
                </Alert>
                {reviews.map((review) => (
                  review.user._id === user._id && (
                    <Box key={review._id} sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" color="primary">
                          Your Review
                        </Typography>
                        <Box>
                          <IconButton
                            color="primary"
                            onClick={() => openEditDialog(review)}
                            sx={{ mr: 1 }}
                            title="Edit Review"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => openDeleteDialog(review)}
                            title="Delete Review"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body1">
                        {review.comment}
                      </Typography>
                    </Box>
                  )
                ))}
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmitReview}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating
                    value={newReview.rating}
                    onChange={(event, newValue) => {
                      setNewReview({ ...newReview, rating: newValue });
                    }}
                    size="large"
                    sx={{ 
                      '& .MuiRating-iconFilled': {
                        color: 'primary.main',
                      },
                      '& .MuiRating-iconHover': {
                        color: 'primary.main',
                      },
                    }}
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
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!newReview.rating || !newReview.comment || isSubmitting}
                  sx={{ mt: 2 }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Submit Review'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Reviews List */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reviews
            </Typography>
            {reviews.length === 0 ? (
              <Typography color="text.secondary">No reviews yet</Typography>
            ) : (
              reviews.map((review) => (
                <Box key={review._id} sx={{ mb: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">
                        {review.user.username}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                    {user && (
                      <Box>
                        {user._id === review.user._id && (
                          <>
                            <IconButton
                              color="primary"
                              onClick={() => openEditDialog(review)}
                              sx={{ mr: 1 }}
                              title="Edit Review"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => openDeleteDialog(review)}
                              title="Delete Review"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                        {user.role === 'admin' && user._id !== review.user._id && (
                          <IconButton
                            color="error"
                            onClick={() => openDeleteDialog(review)}
                            title="Delete Review (Admin)"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {review.comment}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Rating
              value={editingReview.rating}
              onChange={(event, newValue) => {
                setEditingReview({ ...editingReview, rating: newValue });
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              value={editingReview.comment}
              onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={isEditing}>
            Cancel
          </Button>
          <Button onClick={handleEditReview} variant="contained" disabled={isEditing}>
            {isEditing ? <CircularProgress size={24} /> : 'Update Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Review Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteReview} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} /> : 'Delete Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MovieDetail; 