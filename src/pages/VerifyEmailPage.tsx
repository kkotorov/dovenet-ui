import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Button, Alert, CircularProgress } from '@mui/material';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!token) {
      setError('Invalid verification link.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.get(`http://localhost:8080/api/users/verify?token=${token}`);
      setSuccess(res.data?.message || 'Email verified successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed.');
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
          Email Verification
        </Typography>

        {loading && <CircularProgress sx={{ mt: 2 }} />}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {!success && (
          <Button variant="contained" sx={{ mt: 3 }} onClick={handleVerify} disabled={loading}>
            Verify Email
          </Button>
        )}

        {success && (
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        )}
      </Paper>
    </Container>
  );
}

