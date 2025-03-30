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
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from '../utils/axios';

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    releaseYear: '',
    genre: '',
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
      const response = await axios.get('/api/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const handleOpenDialog = (movie = null) => {
    if (movie) {
      setSelectedMovie(movie);
      setFormData({
        title: movie.title,
        description: movie.description,
        releaseYear: movie.releaseYear,
        genre: movie.genre.join(', '),
        director: movie.director,
        cast: movie.cast.join(', '),
        posterUrl: movie.posterUrl,
      });
    } else {
      setSelectedMovie(null);
      setFormData({
        title: '',
        description: '',
        releaseYear: '',
        genre: '',
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
      releaseYear: '',
      genre: '',
      director: '',
      cast: '',
      posterUrl: '',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const movieData = {
        ...formData,
        genre: formData.genre.split(',').map(g => g.trim()),
        cast: formData.cast.split(',').map(actor => actor.trim()),
      };

      if (selectedMovie) {
        await axios.put(`/api/movies/${selectedMovie._id}`, movieData);
      } else {
        await axios.post('/api/movies', movieData);
      }

      handleCloseDialog();
      fetchMovies();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await axios.delete(`/api/movies/${id}`);
        fetchMovies();
      } catch (error) {
        setError('Failed to delete movie');
      }
    }
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
                      <TableCell>{movie.genre.join(', ')}</TableCell>
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Release Year"
              type="number"
              value={formData.releaseYear}
              onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Genre (comma-separated)"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              margin="normal"
              required
            />
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
            />
            <TextField
              fullWidth
              label="Poster URL"
              value={formData.posterUrl}
              onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedMovie ? 'Update' : 'Add'} Movie
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 