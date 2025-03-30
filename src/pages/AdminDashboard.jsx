import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from '../utils/axios';

const VALID_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'TV Movie', 'Thriller', 'War', 'Western'
];

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    genre: [],
    director: '',
    cast: '',
    posterUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
    fetchUsers();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError(error.response?.data?.message || 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      setUsers(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        setError('You are not authorized to view users');
      } else if (error.response?.status === 403) {
        setError('Admin access required to view users');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch users');
      }
    }
  };

  const handleOpenDialog = (movie = null) => {
    if (movie) {
      setSelectedMovie(movie);
      setFormData({
        title: movie.title,
        description: movie.description,
        releaseYear: movie.releaseYear,
        genre: movie.genre,
        director: movie.director,
        cast: movie.cast.join(', '),
        posterUrl: movie.posterUrl,
      });
    } else {
      setSelectedMovie(null);
      setFormData({
        title: '',
        description: '',
        releaseYear: new Date().getFullYear(),
        genre: [],
        director: '',
        cast: '',
        posterUrl: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMovie(null);
    setFormData({
      title: '',
      description: '',
      releaseYear: new Date().getFullYear(),
      genre: [],
      director: '',
      cast: '',
      posterUrl: '',
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.releaseYear || formData.releaseYear < 1888 || formData.releaseYear > new Date().getFullYear() + 5) {
      setError('Invalid release year');
      return false;
    }
    if (!formData.genre.length) {
      setError('At least one genre is required');
      return false;
    }
    if (!formData.director.trim()) {
      setError('Director is required');
      return false;
    }
    if (!formData.cast.trim()) {
      setError('Cast is required');
      return false;
    }
    try {
      new URL(formData.posterUrl);
    } catch (error) {
      setError('Invalid poster URL');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const movieData = {
        ...formData,
        cast: formData.cast.split(',').map(actor => actor.trim()).filter(actor => actor),
      };

      if (selectedMovie) {
        await axios.put(`/movies/${selectedMovie._id}`, movieData);
      } else {
        await axios.post('/movies', movieData);
      }

      handleCloseDialog();
      fetchMovies();
    } catch (error) {
      console.error('Error saving movie:', error);
      setError(error.response?.data?.message || 'Failed to save movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await axios.delete(`/movies/${id}`);
        fetchMovies();
      } catch (error) {
        console.error('Error deleting movie:', error);
        setError(error.response?.data?.message || 'Failed to delete movie');
      }
    }
  };

  const handleGenreChange = (event) => {
    setFormData({
      ...formData,
      genre: event.target.value,
    });
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add New Movie
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Movies
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Genre</TableCell>
                    <TableCell>Release Year</TableCell>
                    <TableCell>Director</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movies.map((movie) => (
                    <TableRow key={movie._id}>
                      <TableCell>{movie.title}</TableCell>
                      <TableCell>
                        {movie.genre.map((g) => (
                          <Chip key={g} label={g} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </TableCell>
                      <TableCell>{movie.releaseYear}</TableCell>
                      <TableCell>{movie.director}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(movie)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteMovie(movie._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Users
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedMovie ? 'Edit Movie' : 'Add New Movie'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Release Year"
              type="number"
              value={formData.releaseYear}
              onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
              margin="normal"
              required
              inputProps={{
                min: 1888,
                max: new Date().getFullYear() + 5
              }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Genre</InputLabel>
              <Select
                multiple
                value={formData.genre}
                onChange={handleGenreChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {VALID_GENRES.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Director"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Cast (comma-separated)"
              value={formData.cast}
              onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
              margin="normal"
              required
              helperText="Enter cast members separated by commas"
            />
            <TextField
              fullWidth
              label="Poster URL"
              value={formData.posterUrl}
              onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
              margin="normal"
              required
              type="url"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedMovie ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 