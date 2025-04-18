import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#3f51b5', // Indigo
        light: '#757de8',
        dark: '#002984',
      },
      secondary: {
        main: '#f50057', // Pink
        light: '#ff5983',
        dark: '#bb002f',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#212121',
        secondary: darkMode ? '#b0b0b0' : '#757575',
      },
      error: {
        main: '#f44336', // Red
      },
      warning: {
        main: '#ff9800', // Orange
      },
      info: {
        main: '#2196f3', // Blue
      },
      success: {
        main: '#4caf50', // Green
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '0em',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '0.00735em',
      },
      h5: {
        fontWeight: 500,
        letterSpacing: '0em',
      },
      h6: {
        fontWeight: 500,
        letterSpacing: '0.0075em',
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.02857em',
        textTransform: 'uppercase',
      }
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: darkMode 
              ? 'linear-gradient(90deg, #002984 0%, #3f51b5 100%)' 
              : 'linear-gradient(90deg, #3f51b5 0%, #757de8 100%)',
            color: '#ffffff',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            color: '#ffffff',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 