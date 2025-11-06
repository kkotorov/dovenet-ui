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
import i18n from 'i18next'; // ✅ add this import at the top

export default function UserSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<{
    username: string;
    email: string;
    emailVerified?: boolean; // <- track if email is verified
  }>({
    username: '',
    email: '',
    emailVerified: true, // default to true
  });

  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');

  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios
      .get('http://localhost:8080/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  
const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const lang = e.target.value;
  setLanguage(lang);
  localStorage.setItem('lang', lang);
  i18n.changeLanguage(lang); // ✅ tell i18next to switch now
};


  const handleEmailUpdate = async () => {
    if (newEmail !== confirmEmail) {
      alert(t('emailsDoNotMatch'));
      return;
    }

    if (!currentPasswordForEmail) {
      alert(t('enterCurrentPassword'));
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        'http://localhost:8080/api/users/me/change-email',
        { newEmail, password: currentPasswordForEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t('emailUpdated'));
      setUser((prev) => ({ ...prev, email: newEmail, emailVerified: false })); // mark unverified
      setShowEmailChange(false);
      setNewEmail('');
      setConfirmEmail('');
      setCurrentPasswordForEmail('');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('settingsFailed'));
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert(t('passwordsDoNotMatch'));
      return;
    }

    if (!oldPassword) {
      alert(t('enterCurrentPassword'));
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        'http://localhost:8080/api/users/me/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t('passwordUpdated'));
      setShowPasswordChange(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('settingsFailed'));
    }
  };

  const handleSendVerificationEmail = async () => {
    const token = localStorage.getItem('token'); // your auth token
    if (!token) {
      alert(t('notLoggedIn'));
      return;
    }

    try {
      await axios.get('http://localhost:8080/api/users/trigger-verify', {
        params: { token }, // pass the token as query param
        headers: { Authorization: `Bearer ${token}` }, // optional, if backend needs auth
      });
      alert(t('verificationEmailSent'));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('settingsFailed'));
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
          <Typography variant="subtitle1">
            {t('email')}: {user.email}{' '}
            {!user.emailVerified && (
              <Typography component="span" color="error">
                ({t('notVerified')})
              </Typography>
            )}
          </Typography>

          {/* Show verification button only if email not verified */}
          {!user.emailVerified && (
            <Button
              sx={{ mt: 1, ml: 1 }}
              variant="contained"
              color="secondary"
              onClick={handleSendVerificationEmail}
            >
              {t('verifyEmail')}
            </Button>
          )}

          <Button
            sx={{ mt: 1, ml: 1 }}
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
            <TextField
              fullWidth
              label={t('currentPassword')}
              type="password"
              value={currentPasswordForEmail}
              onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
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
              label={t('currentPassword')}
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
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
