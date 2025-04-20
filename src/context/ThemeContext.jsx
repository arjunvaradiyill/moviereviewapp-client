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
        main: '#009688', // Teal
        light: '#4DB6AC',
        dark: '#00796B',
      },
      secondary: {
        main: '#673AB7', // Purple
        light: '#9575CD',
        dark: '#512DA8',
      },
      background: {
        default: darkMode ? '#121212' : '#FAFAFA',
        paper: darkMode ? '#1E1E1E' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#FFFFFF' : '#212121',
        secondary: darkMode ? '#B0B0B0' : '#757575',
      },
      error: {
        main: '#E53935', // Red
      },
      warning: {
        main: '#FFB300', // Amber
      },
      info: {
        main: '#29B6F6', // Light Blue
      },
      success: {
        main: '#66BB6A', // Green
      },
    },
    typography: {
      fontFamily: [
        'Poppins',
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
      fontWeightMedium: 600,
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
        fontWeight: 600,
        letterSpacing: '0em',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '0.0075em',
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.02857em',
        textTransform: 'none',
        borderRadius: 8,
      }
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: darkMode 
              ? 'linear-gradient(90deg, #00796B 0%, #009688 100%)' 
              : 'linear-gradient(90deg, #009688 0%, #4DB6AC 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            padding: '8px 16px',
          },
          containedPrimary: {
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 150, 136, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0, 150, 136, 0.4)',
              transform: 'translateY(-2px)',
            },
          },
          containedSecondary: {
            boxShadow: '0 4px 12px rgba(103, 58, 183, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(103, 58, 183, 0.4)',
              transform: 'translateY(-2px)',
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: darkMode ? '0 8px 24px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: darkMode ? '0 12px 30px rgba(0, 0, 0, 0.6)' : '0 12px 30px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 16,
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