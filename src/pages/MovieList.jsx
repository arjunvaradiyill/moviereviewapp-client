import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Rating,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from '../utils/axios';

const MovieList = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const genres = [
    'Action',
    'Comedy',
    'Drama',
    'Horror',
    'Sci-Fi',
    'Romance',
    'Documentary',
    'Other'
  ];

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genre) params.append('genre', genre);

      console.log('Fetching movies with params:', params.toString());
      const response = await axios.get(`/movies?${params}`);
      console.log('Movies response:', response.data);
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to load movies. Please try again later.';
      setError(`${errorMessage} (Status: ${error.response?.status || 'Unknown'})`);
    } finally {
      setLoading(false);
    }
  }, [search, genre]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleMovieClick = (movieId) => {
    if (!movieId) {
      console.error('Invalid movie ID');
      return;
    }
    console.log('Navigating to movie:', movieId);
    navigate(`/movies/${movieId}`);
  };

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

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Search movies"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Genre</InputLabel>
          <Select
            value={genre}
            label="Genre"
            onChange={(e) => setGenre(e.target.value)}
          >
            <MenuItem value="">All Genres</MenuItem>
            {genres.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {movies.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" align="center" color="text.secondary">
              No movies found. Try adjusting your search or filters.
            </Typography>
          </Grid>
        ) : (
          movies.map((movie) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: 6
                  }
                }}
                onClick={() => handleMovieClick(movie._id)}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={movie.posterUrl}
                  alt={movie.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {movie.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formatReleaseDate(movie.releaseMonth, movie.releaseYear)} • {movie.genre.join(', ')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={movie.averageRating} precision={0.1} readOnly />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({movie.totalReviews} reviews)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {movie.description.substring(0, 100)}...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default MovieList; 