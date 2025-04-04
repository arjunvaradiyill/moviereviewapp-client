import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from '../utils/axios';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 6.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'TV Movie', 'Thriller', 'War', 'Western'
];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const MovieFormAdmin = ({ movieId, onSuccess }) => {
  const [movie, setMovie] = useState({
    title: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    releaseMonth: new Date().getMonth() + 1, // Default to current month
    genre: [],
    director: '',
    cast: [],
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [castInput, setCastInput] = useState('');
  const isEditing = !!movieId;

  const fetchMovie = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/movies/${movieId}`);
      setMovie(response.data);
    } catch (error) {
      console.error('Error fetching movie:', error);
      setErrors({ general: 'Failed to load movie data' });
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    if (movieId) {
      fetchMovie();
    }
  }, [movieId, fetchMovie]);

  const validateForm = () => {
    const newErrors = {};
    if (!movie.title.trim()) newErrors.title = 'Title is required';
    if (!movie.description.trim()) newErrors.description = 'Description is required';
    if (!movie.releaseYear || movie.releaseYear < 1888 || movie.releaseYear > new Date().getFullYear() + 5) {
      newErrors.releaseYear = 'Valid release year is required';
    }
    if (movie.releaseMonth && (movie.releaseMonth < 1 || movie.releaseMonth > 12)) {
      newErrors.releaseMonth = 'Release month must be between 1 and 12';
    }
    if (!movie.genre.length) newErrors.genre = 'At least one genre is required';
    if (!movie.director.trim()) newErrors.director = 'Director is required';
    if (!movie.cast.length) newErrors.cast = 'At least one cast member is required';
    if (!movie.posterUrl.trim()) newErrors.posterUrl = 'Poster URL is required';
    
    if (movie.bannerUrl && !isValidUrl(movie.bannerUrl)) {
      newErrors.bannerUrl = 'Invalid URL format';
    }
    
    if (movie.trailerUrl && !isValidUrl(movie.trailerUrl)) {
      newErrors.trailerUrl = 'Invalid URL format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie({ ...movie, [name]: value });
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleGenreChange = (event) => {
    const { value } = event.target;
    setMovie({ ...movie, genre: typeof value === 'string' ? value.split(',') : value });
    if (errors.genre) {
      setErrors({ ...errors, genre: '' });
    }
  };

  const handleAddCast = () => {
    if (castInput.trim()) {
      setMovie({ ...movie, cast: [...movie.cast, castInput.trim()] });
      setCastInput('');
      if (errors.cast) {
        setErrors({ ...errors, cast: '' });
      }
    }
  };

  const handleRemoveCast = (index) => {
    const newCast = [...movie.cast];
    newCast.splice(index, 1);
    setMovie({ ...movie, cast: newCast });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let response;
      if (isEditing) {
        response = await axios.put(`/movies/${movieId}`, movie);
      } else {
        response = await axios.post('/movies', movie);
      }
      
      setSuccess(`Movie ${isEditing ? 'updated' : 'created'} successfully!`);
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} movie`;
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors) {
        const errorObj = {};
        validationErrors.forEach(err => {
          const field = err.param;
          errorObj[field] = err.msg;
        });
        setErrors({ ...errorObj, general: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>
        {isEditing ? 'Edit Movie' : 'Add New Movie'}
      </Typography>

      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={movie.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Release Year"
              name="releaseYear"
              type="number"
              value={movie.releaseYear}
              onChange={handleChange}
              error={!!errors.releaseYear}
              helperText={errors.releaseYear}
              required
              inputProps={{ min: 1888, max: new Date().getFullYear() + 5 }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth error={!!errors.releaseMonth}>
              <InputLabel id="release-month-label">Release Month</InputLabel>
              <Select
                labelId="release-month-label"
                name="releaseMonth"
                value={movie.releaseMonth || ''}
                onChange={handleChange}
                label="Release Month"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {MONTHS.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.releaseMonth && <FormHelperText>{errors.releaseMonth}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Director"
              name="director"
              value={movie.director}
              onChange={handleChange}
              error={!!errors.director}
              helperText={errors.director}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.genre} required>
              <InputLabel>Genre</InputLabel>
              <Select
                multiple
                name="genre"
                value={movie.genre}
                onChange={handleGenreChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {GENRES.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
              {errors.genre && <FormHelperText>{errors.genre}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cast Members
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  label="Add Cast Member"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  error={!!errors.cast}
                  helperText={errors.cast}
                  sx={{ mr: 2 }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleAddCast}
                  disabled={!castInput.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {movie.cast.map((member, index) => (
                  <Chip
                    key={index}
                    label={member}
                    onDelete={() => handleRemoveCast(index)}
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={movie.description}
              onChange={handleChange}
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Poster URL"
              name="posterUrl"
              value={movie.posterUrl}
              onChange={handleChange}
              error={!!errors.posterUrl}
              helperText={errors.posterUrl || "URL for the movie poster image"}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Banner URL"
              name="bannerUrl"
              value={movie.bannerUrl}
              onChange={handleChange}
              error={!!errors.bannerUrl}
              helperText={errors.bannerUrl || "URL for the wide banner image (optional)"}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Trailer URL"
              name="trailerUrl"
              value={movie.trailerUrl}
              onChange={handleChange}
              error={!!errors.trailerUrl}
              helperText={errors.trailerUrl || "YouTube trailer URL (optional)"}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : isEditing ? 'Update Movie' : 'Add Movie'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </StyledPaper>
  );
};

export default MovieFormAdmin; 