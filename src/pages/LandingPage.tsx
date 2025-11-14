import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1E88E5 0%, #90A4AE 100%)',
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 6,
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          textAlign: 'center',
          maxWidth: 400,
          width: '90%',
        }}
      >
        {/* Logo / Illustration */}
        <Box
          component="img"
          src="src/assets/dovenet.jpeg" // Replace with your logo
          alt="DoveNet Logo"
          sx={{ width: 100, mb: 3, mx: 'auto', display: 'block' }}
        />

        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          DoveNet
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          The modern pigeon management system
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ py: 1.5, fontWeight: 600 }}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            sx={{
              py: 1.5,
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 },
            }}
            onClick={() => navigate('/register')}
          >
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
