import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E88E5', // blue
    },
    secondary: {
      main: '#90A4AE', // grey-blue
    },
    background: {
      default: '#F4F6F8', // light grey background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#607D8B',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
  },
  shape: {
    borderRadius: 10,
  },
});

export default theme;
