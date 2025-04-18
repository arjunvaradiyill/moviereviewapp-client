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
        main: '#FFC107',
        light: '#FFD54F',
        dark: '#FFA000',
      },
      secondary: {
        main: '#212121',
        light: '#484848',
        dark: '#000000',
      },
      background: {
        default: darkMode ? '#000000' : '#FFFDE7',
        paper: darkMode ? '#212121' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#FFC107' : '#212121',
        secondary: darkMode ? '#FFD54F' : '#484848',
      },
      error: {
        main: '#F44336',
      },
      warning: {
        main: '#FF9800',
      },
      info: {
        main: '#03A9F4',
      },
      success: {
        main: '#4CAF50',
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
            backgroundColor: darkMode ? '#212121' : '#FFC107',
            color: darkMode ? '#FFC107' : '#000000',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            color: '#000000',
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