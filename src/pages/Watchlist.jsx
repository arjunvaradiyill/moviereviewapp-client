import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Alert,
  CircularProgress,
  Rating,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const Watchlist = () => {
  // We're using auth context to ensure the user is logged in, even if not directly using the user object
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users/me/watchlist');
      setMovies(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setError('Failed to load your watchlist. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      await axios.delete(`/users/me/watchlist/${movieId}`);
      // Remove movie from local state to avoid refetching
      setMovies(movies.filter(movie => movie._id !== movieId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      setError('Failed to remove movie from watchlist');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        My Watchlist
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {movies.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your watchlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start adding movies to your watchlist to keep track of what you want to watch.
          </Typography>
          <Button
            component={Link}
            to="/movies"
            variant="contained"
            color="primary"
          >
            Browse Movies
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {movies.map(movie => (
            <Grid item xs={12} sm={6} md={4} key={movie._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={movie.posterUrl}
                  alt={movie.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {movie.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {movie.releaseYear} • {movie.genre.join(', ')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating
                      value={movie.averageRating || 0}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({movie.totalReviews || 0})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Button
                      component={Link}
                      to={`/movies/${movie._id}`}
                      variant="contained"
                      size="small"
                    >
                      View Details
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveFromWatchlist(movie._id)}
                      title="Remove from watchlist"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Watchlist; 