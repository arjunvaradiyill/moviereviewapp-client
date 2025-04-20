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
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper 
        elevation={0} 
        sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden',
          borderRadius: 4,
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Left Column - Content */}
        <Box 
          sx={{ 
            flex: 1, 
            background: isAdminLogin 
              ? 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)' 
              : 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
            color: 'white',
            p: { xs: 4, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
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
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 0h2v20H9V0zm25.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm-20 20l1.732 1-10 17.32-1.732-1 10-17.32zM58.16 4.134l1 1.732-17.32 10-1-1.732 17.32-10zm-40 40l1 1.732-17.32 10-1-1.732 17.32-10zM80 9v2H60V9h20zM20 69v2H0v-2h20zm79.32-55l-1 1.732-17.32-10L82 4l17.32 10zm-80 80l-1 1.732-17.32-10L2 84l17.32 10zm96.546-75.84l-1.732 1-10-17.32 1.732-1 10 17.32zm-100 100l-1.732 1-10-17.32 1.732-1 10 17.32zM38.16 24.134l1 1.732-17.32 10-1-1.732 17.32-10zM60 29v2H40v-2h20zm19.32 5l-1 1.732-17.32-10L62 24l17.32 10zm16.546 4.16l-1.732 1-10-17.32 1.732-1 10 17.32zM111 40h-2V20h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zM40 49v2H20v-2h20zm19.32 5l-1 1.732-17.32-10L42 44l17.32 10zm-20 20l-1 1.732-17.32-10L22 64l17.32 10zm52.546-59.84l-1.732 1-10-17.32 1.732-1 10 17.32zm-40 40l-1.732 1-10-17.32 1.732-1 10 17.32zM91 60h-2V40h2v20zm3.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm-60 10l1.732 1-10 17.32-1.732-1 10-17.32zM80 69v2H60v-2h20zm-20 20v2H40v-2h20zm39.32-15l-1 1.732-17.32-10L82 64l17.32 10zM100 89v2H80v-2h20zm19.32 5l-1 1.732-17.32-10L102 84l17.32 10z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              {isAdminLogin 
                ? <AdminPanelSettingsIcon sx={{ fontSize: 36, mr: 1.5 }} />
                : <LocalMoviesIcon sx={{ fontSize: 36, mr: 1.5 }} />
              }
              <Typography variant="h4" fontWeight="bold">
                {isAdminLogin ? 'MovieAura Admin' : 'MovieAura'}
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
              {isAdminLogin ? 'Admin Portal' : 'Welcome Back!'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: '90%', fontWeight: 400, fontSize: '1.1rem' }}>
              {isAdminLogin 
                ? 'Log in to access administrative tools for managing movies, reviews, and users.' 
                : 'Log in to access your personalized movie recommendations and continue sharing your reviews.'
              }
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, mb: 3 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} sx={{ fontSize: 28 }} />
              ))}
            </Box>
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
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold" color={isAdminLogin ? 'secondary.main' : 'primary.main'} sx={{ mb: 3 }}>
            {isAdminLogin ? 'Admin Login' : 'Login'}
          </Typography>
          {location.state?.message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {location.state.message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {isAdminLogin && (
            <Alert severity="info" sx={{ mb: 3 }}>
              This area is restricted to administrators only.
            </Alert>
          )}
          <Collapse in={Boolean(serverInfo)}>
            <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
              {serverInfo}
            </Alert>
          </Collapse>
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
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
                mt: 2,
                height: 48,
              }}
              disabled={isLoading || !formData.email || !formData.password}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                  {retry > 0 ? 'Retrying...' : 'Logging in...'}
                </Box>
              ) : (
                'Login'
              )}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
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