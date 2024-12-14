import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // أزرق داكن للطابع الأكاديمي
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#263238', // رمادي داكن
      light: '#4f5b62',
      dark: '#000a12',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Playfair Display',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontFamily: 'Playfair Display',
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '0.02em',
    },
    h2: {
      fontFamily: 'Playfair Display',
      fontWeight: 600,
      fontSize: '2rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});
