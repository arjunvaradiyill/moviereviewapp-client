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
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to={user ? "/home" : "/"}
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MovieIcon />
            IFB
          </Box>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/home">
                Home
              </Button>
              <Button color="inherit" component={RouterLink} to="/movies">
                Movies
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/watchlist"
                startIcon={<BookmarkIcon />}
              >
                Watchlist
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/my-reviews"
              >
                My Reviews
              </Button>
              {user.role === 'admin' && (
                <Chip
                  icon={<AdminPanelSettingsIcon />}
                  label="Admin Dashboard"
                  component={RouterLink}
                  to="/admin"
                  color="primary"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    textDecoration: 'none',
                  }}
                />
              )}
              <Tooltip title="Profile">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{ ml: 1 }}
                  aria-controls={open ? 'profile-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }} src={user.profilePicture}>
                    {user.profilePicture ? '' : user.username ? user.username[0].toUpperCase() : 'U'}
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
                  Account Settings
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
                color="secondary" 
                component={RouterLink} 
                to="/register"
                sx={{
                  fontWeight: 'bold',
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Sign Up
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{
                  fontWeight: 'bold',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                Login
              </Button>
            </>
          )}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 