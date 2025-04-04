import React from 'react';
import { Box, Typography, styled, alpha } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FooterContainer = styled(Box)(({ theme, islandingpage }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: islandingpage === 'true' ? alpha(theme.palette.common.white, 0.8) : alpha(theme.palette.text.secondary, 0.8),
  borderTop: `1px solid ${islandingpage === 'true' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.divider, 0.1)}`,
  backdropFilter: 'blur(5px)',
  backgroundColor: islandingpage === 'true' ? 'transparent' : alpha(theme.palette.background.paper, 0.7),
  position: islandingpage === 'true' ? 'absolute' : 'relative',
  bottom: islandingpage === 'true' ? 0 : 'auto',
  left: islandingpage === 'true' ? 0 : 'auto',
  right: islandingpage === 'true' ? 0 : 'auto',
  width: '100%',
  '& .MuiSvgIcon-root': {
    fontSize: 16,
    color: islandingpage === 'true' ? theme.palette.secondary.light : theme.palette.secondary.main,
    verticalAlign: 'middle',
    margin: '0 4px',
  }
}));

const Footer = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/' && !user;
  
  return (
    <FooterContainer islandingpage={isLandingPage ? 'true' : 'false'}>
      <Typography variant="body2">
        Made with <FavoriteIcon /> by Arjun
      </Typography>
    </FooterContainer>
  );
};

export default Footer; 