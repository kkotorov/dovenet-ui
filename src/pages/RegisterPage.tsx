import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerUser } from '../api/auth';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError(t('registerPage.passwordsMismatch'));
      setLoading(false);
      return;
    }

    try {
      await registerUser(username, email, password);
      setShowDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('registerPage.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    navigate('/login');
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        {t('registerPage.title')}
      </Typography>

      {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

      <Box
        component="form"
        onSubmit={handleRegister}
        sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <TextField
          label={t('registerPage.username')}
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label={t('registerPage.email')}
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label={t('registerPage.password')}
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label={t('registerPage.confirmPassword')}
          type="password"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? t('registerPage.registering') : t('registerPage.register')}
        </Button>

        <Button onClick={() => navigate('/login')} color="secondary">
          {t('registerPage.alreadyHaveAccount')}
        </Button>
      </Box>

      <Dialog open={showDialog} onClose={handleDialogClose}>
        <DialogTitle>{t('registerPage.dialogTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('registerPage.dialogContent')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" autoFocus>
            {t('registerPage.dialogOk')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
