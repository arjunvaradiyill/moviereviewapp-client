import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
  const navigate = useNavigate();

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
      // Clear form
      setFormData({
        username: '',
        email: '',
        password: '',
        showPassword: false
      });
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            registrationSuccess: true,
            email: formData.email 
          } 
        });
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setSubmitError(
        err.response?.data?.message || 
        err.message || 
        'Failed to register. Please try again.'
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
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
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 