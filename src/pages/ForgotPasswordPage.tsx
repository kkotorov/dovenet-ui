import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://161.35.73.100:8080/api/users/forgot-password', { email });
      setMessage(res.data?.message || t('forgotPasswordPage.successMessage'));
    } catch (err: any) {
      setError(err.response?.data?.message || t('forgotPasswordPage.errorMessage'));
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
          {t('forgotPasswordPage.title')}
        </Typography>
        <Typography align="center" color="text.secondary" mb={3}>
          {t('forgotPasswordPage.subtitle')}
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label={t('forgotPasswordPage.emailLabel')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? t('forgotPasswordPage.sending') : t('forgotPasswordPage.sendButton')}
          </Button>
        </Box>

        <Button
          onClick={() => navigate('/login')}
          fullWidth
          sx={{ mt: 2, color: 'secondary.main', textTransform: 'none' }}
        >
          {t('forgotPasswordPage.backToLogin')}
        </Button>
      </Paper>
    </Container>
  );
}
