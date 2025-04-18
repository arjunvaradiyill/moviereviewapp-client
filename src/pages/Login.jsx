import React, { useState, useEffect } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Collapse
} from '@mui/material';
import { Visibility, VisibilityOff, Info as InfoIcon } from '@mui/icons-material';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import StarIcon from '@mui/icons-material/Star';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  const [serverInfo, setServerInfo] = useState('');
  const { login, logout } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAdminLogin = searchParams.get('admin') === 'true';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Check for registration success and email in location state
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email || ''
      }));
    }
  }, [location.state]);

  const handleChange = (prop) => (event) => {
    setFormData({ ...formData, [prop]: event.target.value });
    setError('');
  };

  const handleClickShowPassword = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setServerInfo('');

    try {
      const result = await login(formData.email, formData.password);
      
      // If this is an admin login, check if the user has admin role
      if (isAdminLogin && result && result.user && result.user.role !== 'admin') {
        setError('You do not have administrator privileges. Please use the regular login.');
        logout(); // Log the user out if they don't have admin privileges
        return;
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error types
      if (err.message.includes('timed out') || err.message.includes('starting up')) {
        setRetry(prev => prev + 1);
        setServerInfo('The server is starting up. Free tier servers may take up to a minute to start after inactivity.');
      }
      
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        {/* Left Column - Content */}
        <Box 
          sx={{ 
            flex: 1, 
            bgcolor: isAdminLogin ? 'secondary.dark' : 'primary.main', 
            color: 'white',
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            background: isAdminLogin 
              ? 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)'  // Admin Blue
              : 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)', // Regular Purple
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              opacity: 0.1,
              backgroundImage: isAdminLogin
                ? 'url("https://images.unsplash.com/photo-1462899006636-339e08d1844e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80")'
                : 'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              {isAdminLogin 
                ? <AdminPanelSettingsIcon sx={{ fontSize: 40, mr: 2 }} />
                : <LocalMoviesIcon sx={{ fontSize: 40, mr: 2 }} />
              }
              <Typography variant="h4" fontWeight="bold">
                IFB {isAdminLogin && 'Admin'}
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {isAdminLogin ? 'Admin Portal' : 'Welcome Back!'}
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              {isAdminLogin 
                ? 'Log in to access administrative tools for managing movies, reviews, and users.' 
                : 'Log in to access your personalized movie recommendations and continue sharing your reviews.'
              }
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} sx={{ fontSize: 30, color: '#FFD700' }} />
              ))}
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Join our community of movie enthusiasts and discover your next favorite film.
            </Typography>
          </Box>
        </Box>

        {/* Right Column - Form */}
        <Box 
          sx={{ 
            flex: 1, 
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {isAdminLogin && <AdminPanelSettingsIcon color="primary" fontSize="large" />}
            <Typography variant="h4" component="h1" gutterBottom>
              {isAdminLogin ? 'Admin Login' : 'Login'}
            </Typography>
          </Box>
          {location.state?.message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {location.state.message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {isAdminLogin && (
            <Alert severity="info" sx={{ mb: 2 }}>
              This area is restricted to administrators only. If you're an admin, please enter your credentials.
            </Alert>
          )}
          <Collapse in={Boolean(serverInfo)}>
            <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon />}>
              {serverInfo}
            </Alert>
          </Collapse>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              margin="normal"
              required
              autoComplete="email"
              autoFocus={!formData.email}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Password"
              type={formData.showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              margin="normal"
              required
              autoComplete="current-password"
              autoFocus={Boolean(formData.email)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={isLoading}
                    >
                      {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, height: 56 }}
              disabled={isLoading || !formData.email || !formData.password}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  {retry > 0 ? 'Retrying...' : 'Logging in...'}
                </Box>
              ) : (
                'Login'
              )}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <MuiLink component={Link} to="/register">
                  Register here
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 