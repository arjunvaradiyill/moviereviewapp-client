import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Check for registration success and email in location state
  useEffect(() => {
    if (location.state?.registrationSuccess) {
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

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
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
            bgcolor: 'primary.main', 
            color: 'white',
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            background: 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)',
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
              backgroundImage: 'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <LocalMoviesIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" fontWeight="bold">
                IFDB
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Welcome Back!
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Log in to access your personalized movie recommendations and continue sharing your reviews.
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
          <Typography variant="h4" component="h1" gutterBottom>
            Login
          </Typography>
          {location.state?.registrationSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! Please login with your credentials.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
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
              sx={{ mt: 3 }}
            >
              Login
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