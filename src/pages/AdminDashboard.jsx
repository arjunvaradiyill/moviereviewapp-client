import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Card,
  CardContent,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  Stack,
  useTheme,
  Tab,
  Tabs
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Delete as DeleteIcon, Edit as EditIcon, Movie as MovieIcon, Link as LinkIcon, Person as PersonIcon, AdminPanelSettings as AdminPanelSettingsIcon } from '@mui/icons-material';
import axios from '../utils/axios';
import MovieFormAdmin from '../components/MovieFormAdmin';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Add as AddIcon, Refresh as RefreshIcon, ArrowForward as ArrowForwardIcon, Star as StarIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { Theaters as TheatersIcon } from '@mui/icons-material';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  height: '100%',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
  }
}));

const AdminHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2)
  }
}));

const DashboardTab = styled(Tab)(({ theme }) => ({
  fontSize: '1rem',
  minHeight: 64,
  textTransform: 'none',
  fontWeight: 600,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    fontSize: '1.3rem'
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05)
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    fontWeight: 'bold'
  },
  '& .MuiTableRow-root': {
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.03)
    }
  }
}));

const StatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
  }
}));

const IconWrapper = styled(Box)(({ theme, color = 'primary' }) => ({
  width: 46,
  height: 46,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette[color].main, 0.12),
  color: theme.palette[color].main
}));

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [openMovieDialog, setOpenMovieDialog] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Menu states
  const [userActionsAnchorEl, setUserActionsAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = () => {
    fetchMovies();
    fetchUsers();
    fetchStats();
  };

  const fetchStats = async () => {
    try {
      // These endpoints might not exist yet, so we'll handle potential errors
      let moviesCount = 0;
      let usersCount = 0;
      let reviewsCount = 0;
      
      try {
        const moviesResponse = await axios.get('/movies/count');
        moviesCount = moviesResponse.data?.count || movies.length;
      } catch (e) {
        // Fallback to counting the movies array
        moviesCount = movies.length;
      }
      
      try {
        const usersResponse = await axios.get('/users/count');
        usersCount = usersResponse.data?.count || users.length;
      } catch (e) {
        // Fallback to counting the users array
        usersCount = users.length;
      }
      
      try {
        const reviewsResponse = await axios.get('/reviews/count');
        reviewsCount = reviewsResponse.data?.count || 0;
      } catch (e) {
        // Fallback to summing user review counts
        reviewsCount = users.reduce((total, user) => total + (user.totalReviews || 0), 0);
      }
      
      setStats({
        totalMovies: moviesCount,
        totalUsers: usersCount,
        totalReviews: reviewsCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set stats based on current state
      setStats({
        totalMovies: movies.length,
        totalUsers: users.length,
        totalReviews: users.reduce((total, user) => total + (user.totalReviews || 0), 0)
      });
    }
  };

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

  // User actions menu handlers
  const handleUserActionsClick = (event, user) => {
    setUserActionsAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleUserActionsClose = () => {
    setUserActionsAnchorEl(null);
  };

  const handleViewUser = () => {
    if (selectedUser) {
      navigate(`/profile/${selectedUser._id}`);
    }
    handleUserActionsClose();
  };

  const handleEditUser = () => {
    // TODO: Implement edit user functionality
    alert(`Edit user ${selectedUser?.username} - Feature coming soon`);
    handleUserActionsClose();
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteUserDialogOpen(true);
    handleUserActionsClose();
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`/users/${userToDelete._id}`);
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);
      setError('');
      fetchStats(); // Update stats after deletion
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
    fetchStats(); // Update stats after adding/editing a movie
    handleCloseMovieDialog();
  };

  const handleDeleteMovie = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await axios.delete(`/movies/${id}`);
        fetchMovies();
        fetchStats(); // Update stats after deletion
      } catch (error) {
        console.error('Error deleting movie:', error);
        setError(error.response?.data?.message || 'Failed to delete movie');
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading admin dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <AdminHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AdminPanelSettingsIcon 
            sx={{ 
              fontSize: 40, 
              color: 'secondary.main', 
              mr: 2 
            }} 
          />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ borderRadius: 2 }}
          >
            Refresh Data
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenMovieDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add New Movie
          </Button>
        </Box>
      </AdminHeader>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Dashboard Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>{stats.totalMovies}</Typography>
                  <Typography variant="body1" color="text.secondary">Total Movies</Typography>
                </Box>
                <IconWrapper>
                  <MovieIcon />
                </IconWrapper>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Button 
                  size="small" 
                  onClick={() => setTabValue(0)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Manage Movies
                </Button>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>{stats.totalUsers}</Typography>
                  <Typography variant="body1" color="text.secondary">Registered Users</Typography>
                </Box>
                <IconWrapper color="secondary">
                  <PersonIcon />
                </IconWrapper>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Button 
                  size="small" 
                  onClick={() => setTabValue(1)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Manage Users
                </Button>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>{stats.totalReviews}</Typography>
                  <Typography variant="body1" color="text.secondary">User Reviews</Typography>
                </Box>
                <IconWrapper color="warning">
                  <StarIcon />
                </IconWrapper>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Chip 
                  size="small" 
                  color="success" 
                  icon={<CheckCircleIcon />} 
                  label="All reviews are moderated" 
                />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      <StyledCard sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              '& .MuiTabs-indicator': { 
                height: 3, 
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <DashboardTab 
              icon={<MovieIcon />} 
              label={`Movies (${movies.length})`} 
              id="tab-movies" 
            />
            <DashboardTab 
              icon={<PersonIcon />} 
              label={`Users (${users.length})`} 
              id="tab-users" 
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Movies Tab */}
          {tabValue === 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Movie Library
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenMovieDialog()}
                  sx={{ borderRadius: 2 }}
                >
                  Add Movie
                </Button>
              </Box>
              
              <StyledTableContainer>
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
                    {movies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Box sx={{ py: 3 }}>
                            <Typography variant="body1" color="text.secondary">
                              No movies found
                            </Typography>
                            <Button 
                              variant="contained" 
                              startIcon={<AddIcon />} 
                              sx={{ mt: 2, borderRadius: 2 }}
                              onClick={() => handleOpenMovieDialog()}
                            >
                              Add Your First Movie
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      movies.map((movie) => (
                        <TableRow key={movie._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {movie.posterUrl ? (
                                <Avatar
                                  src={movie.posterUrl}
                                  alt={movie.title}
                                  variant="rounded"
                                  sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    mr: 1.5,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                />
                              ) : (
                                <Avatar
                                  variant="rounded"
                                  sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    mr: 1.5,
                                    bgcolor: 'primary.main'
                                  }}
                                >
                                  <TheatersIcon />
                                </Avatar>
                              )}
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {movie.title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {movie.genre.map((g) => (
                                <Chip
                                  key={g}
                                  label={g}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    mr: 0.5, 
                                    mb: 0.5,
                                    borderRadius: 1.5
                                  }}
                                />
                              ))}
                            </Stack>
                          </TableCell>
                          <TableCell>{movie.releaseYear}</TableCell>
                          <TableCell>{movie.director}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title={movie.posterUrl ? "Poster available" : "No poster"}>
                                <Chip
                                  icon={<MovieIcon />}
                                  label="Poster"
                                  size="small"
                                  color={movie.posterUrl ? "primary" : "default"}
                                  variant={movie.posterUrl ? "filled" : "outlined"}
                                  sx={{ borderRadius: 1.5 }}
                                />
                              </Tooltip>
                              <Tooltip title={movie.trailerUrl ? "Trailer available" : "No trailer"}>
                                <Chip
                                  icon={<LinkIcon />}
                                  label="Trailer"
                                  size="small"
                                  color={movie.trailerUrl ? "secondary" : "default"}
                                  variant={movie.trailerUrl ? "filled" : "outlined"}
                                  sx={{ borderRadius: 1.5 }}
                                />
                              </Tooltip>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Edit movie">
                                <IconButton 
                                  onClick={() => handleOpenMovieDialog(movie)}
                                  size="small"
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete movie">
                                <IconButton 
                                  onClick={() => handleDeleteMovie(movie._id)}
                                  size="small"
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </>
          )}

          {/* Users Tab */}
          {tabValue === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  User Management
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={fetchUsers}
                  sx={{ borderRadius: 2 }}
                >
                  Refresh Users
                </Button>
              </Box>
              
              <StyledTableContainer>
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
                          <Typography color="text.secondary" sx={{ py: 3 }}>
                            No users found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {user.profilePicture ? (
                                <Avatar
                                  src={user.profilePicture}
                                  alt={user.username}
                                  sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    mr: 1.5,
                                    border: user.role === 'admin' ? 
                                      `2px solid ${theme.palette.secondary.main}` : 'none',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                />
                              ) : (
                                <Avatar
                                  sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    mr: 1.5,
                                    bgcolor: user.role === 'admin' ? 
                                      theme.palette.secondary.main : theme.palette.primary.main,
                                    border: user.role === 'admin' ? 
                                      `2px solid ${theme.palette.secondary.main}` : 'none'
                                  }}
                                >
                                  {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                                </Avatar>
                              )}
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {user.username}
                                {user.role === 'admin' && (
                                  <Chip
                                    label="Admin"
                                    size="small"
                                    color="secondary"
                                    sx={{ ml: 1, height: 20, fontWeight: 'bold' }}
                                  />
                                )}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role === 'admin' ? 'Admin' : 'User'}
                              color={user.role === 'admin' ? 'secondary' : 'primary'}
                              variant={user.role === 'admin' ? 'filled' : 'outlined'}
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to change this user's role to ${user.role === 'admin' ? 'user' : 'admin'}?`)) {
                                  const newRole = user.role === 'admin' ? 'user' : 'admin';
                                  handleUpdateUserRole(user._id, newRole);
                                }
                              }}
                              sx={{ 
                                cursor: 'pointer',
                                borderRadius: 1.5,
                                '&:hover': {
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {user.totalReviews !== undefined ? (
                              <Chip 
                                label={user.totalReviews}
                                size="small"
                                color={user.totalReviews > 0 ? "info" : "default"}
                                variant={user.totalReviews > 0 ? "filled" : "outlined"}
                                icon={<StarIcon fontSize="small" />}
                                sx={{ borderRadius: 1.5 }}
                              />
                            ) : (
                              <CircularProgress size={20} />
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              onClick={(event) => handleUserActionsClick(event, user)}
                              disabled={user.role === 'admin'}
                              color="primary"
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </>
          )}
        </Box>
      </StyledCard>

      {/* Movie Form Dialog */}
      <Dialog 
        open={openMovieDialog} 
        onClose={handleCloseMovieDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pt: 3, pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {selectedMovie ? 'Edit Movie' : 'Add New Movie'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 1 }}>
          <MovieFormAdmin 
            movieId={selectedMovie?._id} 
            onSuccess={handleMovieFormSuccess} 
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseMovieDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteUserDialogOpen}
        onClose={() => setDeleteUserDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ pt: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Confirm User Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          {userToDelete && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete user <strong>{userToDelete.username}</strong>?
              </Typography>
              {userToDelete.totalReviews > 0 && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  This will also delete all {userToDelete.totalReviews} reviews created by this user.
                </Alert>
              )}
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2, mb: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
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
        <DialogActions sx={{ px: 3, pb: 3 }}>
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

      {/* User Actions Menu */}
      <Menu
        anchorEl={userActionsAnchorEl}
        open={Boolean(userActionsAnchorEl)}
        onClose={handleUserActionsClose}
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
        }}
      >
        <MenuItem onClick={handleViewUser}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Profile
        </MenuItem>
        <MenuItem onClick={handleEditUser}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem onClick={() => handleDeleteUser(selectedUser)} disabled={selectedUser?.role === 'admin'}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default AdminDashboard; 