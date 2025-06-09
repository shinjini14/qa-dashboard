import '../styles/globals.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from '../contexts/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    primary: {
      main: '#304ffe',
      light: '#5472ff',
      dark: '#1e3aff',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#304ffe',
      light: '#5472ff',
      dark: '#1e3aff',
      contrastText: '#ffffff'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0'
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    action: {
      hover: 'rgba(48, 79, 254, 0.08)',
      selected: 'rgba(48, 79, 254, 0.12)',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
          border: '1px solid rgba(48, 79, 254, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
          boxShadow: '0 4px 20px rgba(48, 79, 254, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1e3aff, #6c3dff)',
            boxShadow: '0 6px 25px rgba(48, 79, 254, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(48, 79, 254, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(48, 79, 254, 0.2)',
          },
        },
      },
    },
  },
});

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}

