import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Movie as MovieIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const MyReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    rating: 0,
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserReviews();
  }, []);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/users/me/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load your reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (review) => {
    setSelectedReview(review);
    setEditData({
      rating: review.rating,
      comment: review.comment,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedReview(null);
  };

  const handleOpenDeleteDialog = (review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedReview(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleRatingChange = (newValue) => {
    setEditData({ ...editData, rating: newValue });
  };

  const handleSubmitEdit = async () => {
    if (!selectedReview) return;

    try {
      setIsSubmitting(true);
      const response = await axios.put(`/reviews/${selectedReview._id}`, {
        rating: editData.rating,
        comment: editData.comment,
      });

      // Update the review in the list
      if (response.data) {
        setReviews(reviews.map(review => 
          review._id === selectedReview._id ? { ...review, ...response.data } : review
        ));
      }
      
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating review:', error);
      setError('Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      setIsSubmitting(true);
      
      // Make sure we're working with the actual review ID
      const reviewId = selectedReview._id;
      console.log('Attempting to delete review with ID:', reviewId);
      
      // Explicitly set the config to ensure headers are properly included
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      // Use a more robust approach to make the delete request
      const response = await axios.delete(`/reviews/${reviewId}`, config);
      console.log('Delete response:', response.data);
      
      // Remove the review from the list
      setReviews(reviews.filter(review => review._id !== reviewId));
      
      // Show success message (replace error with success toast if possible)
      setError('');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting review:', error);
      
      // Enhanced error logging and handling
      let errorMessage = 'Failed to delete review. Please try again.';
      console.log('Error object structure:', JSON.stringify({
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : 'No response',
        request: error.request ? 'Request exists' : 'No request',
        message: error.message
      }));
      
      if (error.response) {
        console.log('Error response:', error.response.data);
        
        if (error.response.status === 404) {
          errorMessage = 'Review not found. It may have been already deleted.';
        } else if (error.response.status === 403) {
          errorMessage = 'You are not authorized to delete this review.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
      handleCloseDeleteDialog();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Please log in to view your reviews.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Reviews
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {reviews.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <MovieIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            You haven't written any reviews yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start rating and reviewing movies to see them here.
          </Typography>
          <Button
            component={Link}
            to="/movies"
            variant="contained"
            color="primary"
          >
            Browse Movies
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review._id}>
              <Card>
                <Grid container>
                  <Grid item xs={12} sm={3}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={review.movie && review.movie.posterUrl ? review.movie.posterUrl : 'https://via.placeholder.com/300x450?text=No+Poster'}
                      alt={review.movie ? review.movie.title : 'Movie'}
                      sx={{ objectFit: 'cover' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component={Link} to={review.movie ? `/movies/${review.movie._id}` : '#'} sx={{ textDecoration: 'none', color: 'inherit' }}>
                          {review.movie ? review.movie.title : 'Unknown Movie'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={review.rating} readOnly precision={0.5} />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({review.rating.toFixed(1)})
                        </Typography>
                      </Box>
                      <Typography variant="body1" paragraph>
                        {review.comment}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEditDialog(review)}
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleOpenDeleteDialog(review)}
                        size="small"
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              {selectedReview?.movie?.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography component="legend">Rating:</Typography>
              <Rating
                name="rating"
                value={editData.rating}
                onChange={(event, newValue) => handleRatingChange(newValue)}
                precision={0.5}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Review"
              name="comment"
              value={editData.comment}
              onChange={handleEditChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitEdit}
            color="primary"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Review Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your review for "{selectedReview?.movie?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteReview}
            color="error"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyReviews; 