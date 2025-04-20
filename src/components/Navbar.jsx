import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import MovieIcon from '@mui/icons-material/Movie';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleClose();
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ py: 1 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to={user ? "/home" : "/"}
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.25rem',
            letterSpacing: '0.01em',
          }}
        >
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MovieIcon sx={{ fontSize: 26 }} />
            MovieAura
          </Box>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {user ? (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/home"
                sx={{ 
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
              >
                Home
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/movies"
                sx={{ fontWeight: 500 }}
              >
                Movies
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/watchlist"
                startIcon={<BookmarkIcon />}
                sx={{ 
                  fontWeight: 500,
                  display: { xs: 'none', md: 'inline-flex' }
                }}
              >
                Watchlist
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/my-reviews"
                sx={{ 
                  fontWeight: 500,
                  display: { xs: 'none', md: 'inline-flex' }
                }}
              >
                Reviews
              </Button>
              {user.role === 'admin' && (
                <Chip
                  icon={<AdminPanelSettingsIcon fontSize="small" />}
                  label="Admin"
                  component={RouterLink}
                  to="/admin"
                  color="secondary"
                  size="small"
                  sx={{
                    fontWeight: 500,
                    px: 0.5,
                    height: 32
                  }}
                />
              )}
              <Tooltip title="Profile">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  size="small"
                  sx={{ ml: 1 }}
                  aria-controls={open ? 'profile-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: user.role === 'admin' ? 'secondary.main' : 'primary.main',
                    }} 
                    src={user.profilePicture}
                  >
                    {user.profilePicture 
                      ? '' 
                      : user && user.username && typeof user.username === 'string' && user.username.length > 0
                        ? user.username[0].toUpperCase() 
                        : 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'profile-button',
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'visible',
                    mt: 1.5,
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1,
                    },
                  },
                }}
              >
                <MenuItem onClick={handleClose} disabled sx={{ opacity: 1 }}>
                  <Typography variant="subtitle2">
                    {user.username || 'User'}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleSettingsClick}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/register"
                size="small"
                color="secondary"
                sx={{
                  fontWeight: 500,
                  px: { xs: 2, sm: 3 },
                  py: 0.75
                }}
              >
                Sign Up
              </Button>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/login"
                size="small"
                sx={{
                  fontWeight: 500,
                  px: { xs: 2, sm: 3 },
                  py: 0.75
                }}
              >
                Login
              </Button>
              <Button 
                component={RouterLink} 
                to="/login?admin=true"
                color="inherit"
                size="small"
                startIcon={<AdminPanelSettingsIcon />}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  fontWeight: 500,
                }}
              >
                Admin
              </Button>
            </>
          )}
          <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
            <IconButton size="small" color="inherit" onClick={toggleTheme}>
              {darkMode ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 