import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button, Box, styled, keyframes, alpha } from '@mui/material';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FullBgWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  backgroundImage: 'url(https://i.pinimg.com/736x/20/cc/3a/20cc3a50077b33dcf683519400b0d797.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}));

const Overlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: `linear-gradient(120deg, ${alpha('#000', 0.7)}, ${alpha('#222', 0.7)})`,
  zIndex: 1,
}));

const Content = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  width: '100%',
  textAlign: 'center',
  color: '#fff',
  padding: theme.spacing(4),
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  fontSize: '4rem',
  letterSpacing: '-0.04em',
  marginBottom: theme.spacing(2),
  color: '#fff',
  animation: `${fadeIn} 1s cubic-bezier(0.4,0,0.2,1)`,
  textShadow: '0 4px 32px rgba(0,0,0,0.5)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2.5rem',
  },
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '1.5rem',
  color: alpha('#fff', 0.92),
  marginBottom: theme.spacing(5),
  animation: `${fadeIn} 1.3s cubic-bezier(0.4,0,0.2,1)`,
  textShadow: '0 2px 16px rgba(0,0,0,0.4)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

const CTAButton = styled(Button)(({ theme }) => ({
  borderRadius: 32,
  padding: theme.spacing(1.5, 6),
  fontWeight: 700,
  fontSize: '1.2rem',
  background: theme.palette.primary.main,
  color: theme.palette.getContrastText(theme.palette.primary.main),
  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
  animation: `${fadeIn} 1.6s cubic-bezier(0.4,0,0.2,1)`,
  textTransform: 'none',
  '&:hover': {
    background: theme.palette.primary.dark,
    color: theme.palette.getContrastText(theme.palette.primary.dark),
    transform: 'translateY(-2px)',
  },
}));

const LandingPage = () => {
  return (
    <FullBgWrapper>
      <Overlay />
      <Content>
        <MainTitle>Welcome to IFB</MainTitle>
        <SubTitle>Your ultimate destination for film discovery and discussion</SubTitle>
        <CTAButton component={Link} to="/register" size="large" variant="contained">
          Get Started
        </CTAButton>
      </Content>
    </FullBgWrapper>
  );
};

export default LandingPage;
