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
              ? 'linear-gradient(135deg, #512DA8 0%, #673AB7 100%)'  // Admin Purple
              : 'linear-gradient(135deg, #00796B 0%, #009688 100%)', // Regular Teal
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              opacity: 0.05,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '24px 24px',
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              {isAdminLogin 
                ? <AdminPanelSettingsIcon sx={{ fontSize: 40, mr: 2 }} />
                : <LocalMoviesIcon sx={{ fontSize: 40, mr: 2 }} />
              }
              <Typography variant="h4" fontWeight="bold" sx={{ 
                backgroundImage: 'linear-gradient(90deg, #FFFFFF, rgba(255,255,255,0.7))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}>
                {isAdminLogin ? 'MovieAura Admin' : 'MovieAura'}
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ 
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              mb: 2 
            }}>
              {isAdminLogin ? 'Admin Portal' : 'Welcome Back!'}
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 'normal', maxWidth: '90%' }}>
              {isAdminLogin 
                ? 'Log in to access administrative tools for managing movies, reviews, and users.' 
                : 'Log in to access your personalized movie recommendations and continue sharing your reviews.'
              }
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} sx={{ fontSize: 30, color: isAdminLogin ? '#9575CD' : '#4DB6AC' }} />
              ))}
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300, letterSpacing: '0.015em' }}>
              Join our community of movie enthusiasts and discover your next favorite film.
            </Typography>
          </Box>
        </Box>

        {/* Right Column - Form */}
        <Box 
          sx={{ 
            flex: 1, 
            p: { xs: 4, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            {isAdminLogin && <AdminPanelSettingsIcon color="secondary" fontSize="large" />}
            <Typography variant="h4" component="h1" fontWeight="bold" color={isAdminLogin ? 'secondary.main' : 'primary.main'}>
              {isAdminLogin ? 'Admin Login' : 'Login'}
            </Typography>
          </Box>
          {location.state?.message && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {location.state.message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {isAdminLogin && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              This area is restricted to administrators only. If you're an admin, please enter your credentials.
            </Alert>
          )}
          <Collapse in={Boolean(serverInfo)}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<InfoIcon />}>
              {serverInfo}
            </Alert>
          </Collapse>
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            noValidate
            sx={{
              '& .MuiTextField-root': {
                mb: 2.5,
              }
            }}
          >
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              autoComplete="email"
              autoFocus={!formData.email}
              disabled={isLoading}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={formData.showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              required
              autoComplete="current-password"
              autoFocus={Boolean(formData.email)}
              disabled={isLoading}
              InputProps={{
                sx: { borderRadius: 2 },
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
              color={isAdminLogin ? "secondary" : "primary"}
              sx={{ 
                mt: 4, 
                mb: 2,
                height: 56,
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: isAdminLogin 
                    ? '0 6px 16px rgba(103, 58, 183, 0.3)' 
                    : '0 6px 16px rgba(0, 150, 136, 0.3)',
                  transform: 'translateY(-2px)',
                }
              }}
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
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <MuiLink 
                  component={Link} 
                  to="/register" 
                  sx={{ 
                    fontWeight: 600,
                    color: isAdminLogin ? 'secondary.main' : 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
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