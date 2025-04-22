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
import { styled, alpha } from '@mui/material/styles';
import { Delete as DeleteIcon, Edit as EditIcon, Movie as MovieIcon, Link as LinkIcon, Dashboard as DashboardIcon, Person as PersonIcon } from '@mui/icons-material';
import axios from '../utils/axios';
import MovieFormAdmin from '../components/MovieFormAdmin';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
  }
}));

const AdminHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  paddingBottom: theme.spacing(2)
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& .MuiTypography-root': {
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main
    }
  }
}));

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [openMovieDialog, setOpenMovieDialog] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
      setError('');
      const response = await axios.get('/users');
      
      // Get the users data
      const usersData = response.data;
      
      // For each user, fetch their review count
      const usersWithReviewCounts = await Promise.all(
        usersData.map(async (user) => {
          try {
            // Skip review counting for admin users to avoid unnecessary API calls
            if (user.role === 'admin') {
              return { ...user, totalReviews: 0 };
            }
            
            const reviewResponse = await axios.get(`/reviews/count/user/${user._id}`);
            return { 
              ...user, 
              totalReviews: reviewResponse.data.count || 0 
            };
          } catch (error) {
            console.error(`Error fetching review count for user ${user._id}:`, error);
            return { ...user, totalReviews: 0 };
          }
        })
      );
      
      setUsers(usersWithReviewCounts);
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

  const handleDeleteUser = (user) => {
    if (user.role === 'admin') {
      setError('Cannot delete admin users');
      return;
    }
    setUserToDelete(user);
    setDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`/users/${userToDelete._id}`);
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);
      setError('');
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to delete user';
      const statusCode = error.response?.status;
      setError(`${errorMessage} (Status: ${statusCode || 'Unknown'})`);
      setDeleteUserDialogOpen(false);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AdminHeader>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ mr: 1 }} fontSize="large" color="primary" />
          Admin Dashboard
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpenMovieDialog()}
          startIcon={<MovieIcon />}
          sx={{ borderRadius: 2 }}
        >
          Add New Movie
        </Button>
      </AdminHeader>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <SectionHeader>
              <Typography variant="h6">
                <MovieIcon />
                Movies ({movies.length})
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={fetchMovies}
                sx={{ borderRadius: 2 }}
              >
                Refresh Movies
              </Button>
            </SectionHeader>
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
          </StyledPaper>
        </Grid>

        <Grid item xs={12}>
          <StyledPaper>
            <SectionHeader>
              <Typography variant="h6">
                <PersonIcon />
                Users ({users.length})
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={fetchUsers}
                sx={{ borderRadius: 2 }}
              >
                Refresh Users
              </Button>
            </SectionHeader>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Reviews</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="textSecondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {user.profilePicture ? (
                              <Box
                                component="img"
                                src={user.profilePicture}
                                alt={user.username}
                                sx={{ 
                                  width: 36, 
                                  height: 36, 
                                  borderRadius: '50%', 
                                  mr: 1,
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/36x36?text=User';
                                }}
                              />
                            ) : (
                              <Box 
                                sx={{ 
                                  width: 36, 
                                  height: 36, 
                                  borderRadius: '50%', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  mr: 1
                                }}
                              >
                                {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                              </Box>
                            )}
                            {user.username}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={user.role === 'admin' ? 'secondary' : 'default'}
                            variant={user.role === 'admin' ? 'filled' : 'outlined'}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to change this user's role to ${user.role === 'admin' ? 'user' : 'admin'}?`)) {
                                const newRole = user.role === 'admin' ? 'user' : 'admin';
                                handleUpdateUserRole(user._id, newRole);
                              }
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {user.totalReviews !== undefined ? (
                            user.totalReviews
                          ) : (
                            <CircularProgress size={20} />
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.role === 'admin'}
                            color="error"
                            title={user.role === 'admin' ? "Cannot delete admin users" : "Delete user"}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledPaper>
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

      {/* Delete User Dialog */}
      <Dialog
        open={deleteUserDialogOpen}
        onClose={() => setDeleteUserDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: 2, p: 1 }
        }}
      >
        <DialogTitle id="alert-dialog-title">Confirm User Deletion</DialogTitle>
        <DialogContent>
          {userToDelete && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete user <strong>{userToDelete.username}</strong>?
              </Typography>
              {userToDelete.totalReviews > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This will also delete all {userToDelete.totalReviews} reviews created by this user.
                </Alert>
              )}
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {userToDelete.email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Role:</strong> {userToDelete.role}
                </Typography>
                <Typography variant="body2">
                  <strong>Account created:</strong> {new Date(userToDelete.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteUserDialogOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteUser} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2 }}
            autoFocus
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 