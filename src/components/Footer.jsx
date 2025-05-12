import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Styled component with dynamic color based on theme mode
const FooterContainer = styled(Box)(({ theme, islandingpage }) => {
  const isLanding = islandingpage === 'true';
  const isLightMode = theme.palette.mode === 'light';

  return {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: isLanding
      ? isLightMode
        ? '#000' // High contrast text for light landing page
        : '#fff' // White for dark theme
      : theme.palette.text.secondary,
    borderTop: `1px solid ${
      isLanding
        ? isLightMode
          ? 'rgba(0, 0, 0, 0.1)'
          : 'rgba(255, 255, 255, 0.1)'
        : theme.palette.divider
    }`,
    backdropFilter: 'blur(5px)',
    backgroundColor: isLanding
      ? 'transparent'
      : theme.palette.background.paper,
    position: isLanding ? 'absolute' : 'relative',
    bottom: isLanding ? 0 : 'auto',
    left: isLanding ? 0 : 'auto',
    right: isLanding ? 0 : 'auto',
    width: '100%',
    '& .MuiSvgIcon-root': {
      fontSize: 16,
      color: isLanding
        ? isLightMode
          ? '#000'
          : '#fff'
        : theme.palette.secondary.main,
      verticalAlign: 'middle',
      margin: '0 4px',
    },
  };
});

const Footer = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Landing page is considered if at "/" and user is not logged in
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
