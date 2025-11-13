import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!token) {
      setError(t('verifyEmailPage.invalidLink'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.get(`http://161.35.73.100:8080/api/users/verify?token=${token}`);
      setSuccess(res.data?.message || t('verifyEmailPage.successMessage'));
    } catch (err: any) {
      setError(err.response?.data?.message || t('verifyEmailPage.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper elevation={6} sx={{ p: 5, width: '100%', borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t('verifyEmailPage.title')}
        </Typography>

        {loading && <CircularProgress sx={{ mt: 2 }} />}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {!success && (
          <Button variant="contained" sx={{ mt: 3 }} onClick={handleVerify} disabled={loading}>
            {t('verifyEmailPage.verifyButton')}
          </Button>
        )}

        {success && (
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/login')}>
            {t('verifyEmailPage.goToLogin')}
          </Button>
        )}
      </Paper>
    </Container>
  );
}
