import { Box } from '@mui/material';

const Footer = () => (
  <Box
    sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      padding: 2,
      zIndex: 1000,
      borderTop: 'none',
      textAlign: 'center',
      fontWeight: 500,
      fontSize: '1rem',
    }}
  >
    Made with <span style={{ color: '#ff1744', margin: '0 4px' }}>❤️</span> by Arjun
  </Box>
);

export default Footer;