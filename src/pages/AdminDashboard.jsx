import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Movie as MovieIcon, Link as LinkIcon } from '@mui/icons-material';
import axios from '../utils/axios';
import MovieFormAdmin from '../components/MovieFormAdmin';

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [openMovieDialog, setOpenMovieDialog] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
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
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch users';
      const statusCode = error.response?.status;
      
      if (statusCode === 401) {
        setError('You are not authorized to view users. Please log in again.');
        window.location.href = '/login';
      } else if (statusCode === 403) {
        setError('Admin access required to view users');
      } else {
        setError(`${errorMessage} (Status: ${statusCode || 'Unknown'})`);
      }
    }
  };

  const handleOpenMovieDialog = (movie = null) => {
    setSelectedMovie(movie);
    setOpenMovieDialog(true);
  };

  const handleCloseMovieDialog = () => {
    setOpenMovieDialog(false);
    setSelectedMovie(null);
  };

  const handleMovieFormSuccess = () => {
    fetchMovies();
    handleCloseMovieDialog();
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

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to delete user';
        const statusCode = error.response?.status;
        setError(`${errorMessage} (Status: ${statusCode || 'Unknown'})`);
      }
    }
  };

  const handleUpdateUserRole = async (id, newRole) => {
    try {
      await axios.put(`/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to update user role';
      const statusCode = error.response?.status;
      setError(`${errorMessage} (Status: ${statusCode || 'Unknown'})`);
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
        <Button variant="contained" onClick={() => handleOpenMovieDialog()}>
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
                    <TableCell>Media</TableCell>
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            icon={<MovieIcon />} 
                            label="Poster" 
                            size="small" 
                            color={movie.posterUrl ? "primary" : "default"} 
                            variant={movie.posterUrl ? "filled" : "outlined"}
                          />
                          <Chip 
                            icon={<MovieIcon />} 
                            label="Banner" 
                            size="small" 
                            color={movie.bannerUrl ? "primary" : "default"} 
                            variant={movie.bannerUrl ? "filled" : "outlined"}
                          />
                          <Chip 
                            icon={<LinkIcon />} 
                            label="Trailer" 
                            size="small" 
                            color={movie.trailerUrl ? "primary" : "default"} 
                            variant={movie.trailerUrl ? "filled" : "outlined"}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenMovieDialog(movie)}>
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
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          onClick={() => {
                            const newRole = user.role === 'admin' ? 'user' : 'admin';
                            handleUpdateUserRole(user._id, newRole);
                          }}
                        />
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteUser(user._id)}>
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
      </Grid>

      {/* Movie Form Dialog */}
      <Dialog 
        open={openMovieDialog} 
        onClose={handleCloseMovieDialog} 
        maxWidth="md" 
        fullWidth
        sx={{ '& .MuiDialogContent-root': { px: 3, py: 1 } }}
      >
        <DialogTitle>
          {selectedMovie ? 'Edit Movie' : 'Add New Movie'}
        </DialogTitle>
        <DialogContent>
          <MovieFormAdmin 
            movieId={selectedMovie?._id} 
            onSuccess={handleMovieFormSuccess} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMovieDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 