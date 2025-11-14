
import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginUser } from '../api/auth';

export default function LoginPage() {
  const { t } = useTranslation();
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
      setError(err.response?.data?.message || t('loginPage.errorMessage'));
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
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: 'primary.main', fontWeight: 700 }}
        >
          {t('loginPage.title')}
        </Typography>
        <Typography align="center" color="text.secondary" mb={3}>
          {t('loginPage.description')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('loginPage.usernameLabel')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('loginPage.passwordLabel')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
            {loading ? t('loginPage.loggingInButton') : t('loginPage.loginButton')}
          </Button>
        </Box>

        <Button
          onClick={() => navigate('/register')}
          fullWidth
          sx={{ mt: 2, color: 'secondary.main', textTransform: 'none' }}
        >
          {t('loginPage.registerLink')}
        </Button>

        <Button
          onClick={() => navigate('/forgot-password')}
          fullWidth
          sx={{ mt: 1, color: 'primary.main', textTransform: 'none' }}
        >
          {t('loginPage.forgotPasswordLink')}
        </Button>

      </Paper>
    </Container>
  );
}
