import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  useTheme,
  useMediaQuery,
  Link as MuiLink
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import TheatersIcon from '@mui/icons-material/Theaters';
import RateReviewIcon from '@mui/icons-material/RateReview';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    showPassword: false
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (prop) => (event) => {
    setFormData({ ...formData, [prop]: event.target.value });
    // Clear error when user starts typing
    if (errors[prop]) {
      setErrors({ ...errors, [prop]: '' });
    }
    setSubmitError('');
  };

  const handleClickShowPassword = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      setSuccess(true);
      // The register function now handles redirection to login
    } catch (err) {
      console.error('Registration error:', err);
      setSubmitError(
        err.response?.data?.message || 
        err.message || 
        'Failed to register. Please try again.'
      );
    }
  };

  const features = [
    {
      icon: <TheatersIcon fontSize="large" />,
      title: "Discover Movies",
      description: "Explore thousands of movies from all genres and time periods."
    },
    {
      icon: <RateReviewIcon fontSize="large" />,
      title: "Share Your Opinion",
      description: "Write reviews and rate movies to help others find great content."
    },
    {
      icon: <FavoriteIcon fontSize="large" />,
      title: "Build Your Collection",
      description: "Create watchlists and keep track of your favorite films."
    }
  ];

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
            background: 'linear-gradient(135deg, #00897b 0%, #004d40 100%)',
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
              backgroundImage: 'url("https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80")',
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
              Join the Community
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Create an account to unlock all the features of our movie review platform.
            </Typography>

            <Box sx={{ mt: 4 }}>
              {features.map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 3, alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    p: 1, 
                    mr: 2, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Typography variant="body2" sx={{ mt: 4, opacity: 0.8 }}>
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" sx={{ color: 'white', fontWeight: 'bold' }}>
                Login here
              </MuiLink>
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
            Register
          </Typography>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! Redirecting to login page...
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={handleChange('username')}
              margin="normal"
              required
              error={Boolean(errors.username)}
              helperText={errors.username}
              autoComplete="username"
              disabled={success}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              margin="normal"
              required
              error={Boolean(errors.email)}
              helperText={errors.email}
              autoComplete="email"
              disabled={success}
            />
            <TextField
              fullWidth
              label="Password"
              type={formData.showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              margin="normal"
              required
              error={Boolean(errors.password)}
              helperText={errors.password}
              autoComplete="new-password"
              disabled={success}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={success}
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
              disabled={success}
            >
              Register
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <MuiLink component={Link} to="/login">
                  Login here
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 