import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/user';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper elevation={6} sx={{ p: 5, width: '100%', borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
          Welcome Back
        </Typography>
        <Typography align="center" color="text.secondary" mb={3}>
          Sign in to manage your pigeons 🕊️
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </Box>

        <Button
          onClick={() => navigate('/register')}
          fullWidth
          sx={{ mt: 2, color: 'secondary.main', textTransform: 'none' }}
        >
          Don’t have an account? Register
        </Button>

        <Button
          onClick={() => navigate('/forgot-password')}
          fullWidth
          sx={{ mt: 1, color: 'primary.main', textTransform: 'none' }}
        >
          Forgot your password?
        </Button>

      </Paper>
    </Container>
  );
}
