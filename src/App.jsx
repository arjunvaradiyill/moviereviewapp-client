import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, styled } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import ConnectionErrorHandler from './utils/ConnectionErrorHandler';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieList from './pages/MovieList';
import MovieDetail from './pages/MovieDetail';
import AdminDashboard from './pages/AdminDashboard';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import MyReviews from './pages/MyReviews';
import LandingPage from './pages/LandingPage';

// Styled component for the app layout
const AppContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
});

const MainContent = styled(Box)({
  flex: 1,
});

// Create a wrapper component that uses the auth context
const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <AppContainer>
      <Navbar />
      <MainContent>
        <Routes>
          {/* Auth Routes - only accessible when logged out */}
          {!user ? (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              {/* Protected Routes - only accessible when logged in */}
              <Route path="/home" element={<Home />} />
              <Route path="/movies" element={<MovieList />} />
              <Route path="/movies/:id" element={<MovieDetail />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/my-reviews" element={<MyReviews />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Redirect root and unknown paths to home when logged in */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/login" element={<Navigate to="/home" replace />} />
              <Route path="/register" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </>
          )}
        </Routes>
      </MainContent>
      <Footer />
    </AppContainer>
  );
};

// Add a DevelopmentBanner component to indicate when running in development mode
const DevelopmentBanner = () => {
  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) return null;
  
  return (
    <Box 
      sx={{ 
        bgcolor: 'warning.main', 
        color: 'warning.contrastText',
        p: 0.5,
        textAlign: 'center',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 9999,
      }}
    >
      DEVELOPMENT MODE {isLocalhost ? '(localhost)' : '(remote)'}
    </Box>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <ConnectionErrorHandler />
        <DevelopmentBanner />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 