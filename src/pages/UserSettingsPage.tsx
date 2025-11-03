import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Collapse,
  Paper,
} from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function UserSettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<{ username: string; email: string }>({
    username: '',
    email: '',
  });

  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');

  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios
      .get('http://localhost:8080/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const handleEmailUpdate = async () => {
    if (newEmail !== confirmEmail) {
      alert(t('emailsDoNotMatch'));
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        'http://localhost:8080/api/users/update-email',
        { email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t('emailUpdated'));
      setUser((prev) => ({ ...prev, email: newEmail }));
      setShowEmailChange(false);
      setNewEmail('');
      setConfirmEmail('');
    } catch (err) {
      console.error(err);
      alert(t('settingsFailed'));
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert(t('passwordsDoNotMatch'));
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        'http://localhost:8080/api/users/update-password',
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t('passwordUpdated'));
      setShowPasswordChange(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      alert(t('settingsFailed'));
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('userSettings')}
      </Typography>

      <Paper sx={{ p: 3, mt: 3, maxWidth: 500 }}>
        {/* Username (static) */}
        <TextField
          fullWidth
          label={t('username')}
          value={user.username}
          disabled
          sx={{ mb: 3 }}
        />

        {/* Email section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1">{t('email')}: {user.email}</Typography>
          <Button
            sx={{ mt: 1 }}
            variant="outlined"
            onClick={() => setShowEmailChange(!showEmailChange)}
          >
            {showEmailChange ? t('cancel') : t('changeEmail')}
          </Button>

          <Collapse in={showEmailChange} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t('newEmail')}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('confirmEmail')}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleEmailUpdate}>
              {t('saveEmail')}
            </Button>
          </Collapse>
        </Box>

        {/* Password section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1">{t('changePassword')}</Typography>
          <Button
            sx={{ mt: 1 }}
            variant="outlined"
            onClick={() => setShowPasswordChange(!showPasswordChange)}
          >
            {showPasswordChange ? t('cancel') : t('changePassword')}
          </Button>

          <Collapse in={showPasswordChange} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t('newPassword')}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handlePasswordUpdate}>
              {t('savePassword')}
            </Button>
          </Collapse>
        </Box>

        {/* Language selector */}
        <TextField
          select
          fullWidth
          label={t('language')}
          value={language}
          onChange={handleLanguageChange}
          sx={{ mb: 3 }}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="bg">Български</MenuItem>
        </TextField>

        {/* Navigation */}
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          {t('back')}
        </Button>
      </Paper>
    </Container>
  );
}
