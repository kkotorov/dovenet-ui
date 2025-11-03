import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function UserSettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<{ username: string; email: string }>({ username: '', email: '' });
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios
      .get('http://localhost:8080/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setNewEmail(res.data.email);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      if (newEmail && newEmail !== user.email) {
        await axios.patch(
          'http://localhost:8080/api/users/update-email',
          { email: newEmail },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      if (newPassword) {
        await axios.patch(
          'http://localhost:8080/api/users/update-password',
          { password: newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      alert(t('settingsSaved'));
    } catch (err) {
      console.error(err);
      alert(t('settingsFailed'));
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>{t('userSettings')}</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3, maxWidth: 400 }}>
        <TextField label={t('username')} value={user.username} disabled />
        <TextField
          label={t('email')}
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <TextField
          label={t('newPassword')}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          select
          label={t('language')}
          value={language}
          onChange={handleLanguageChange}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="bg">Български</MenuItem>
        </TextField>

        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={() => navigate('/dashboard')}>
            {t('back')}
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {t('saveChanges')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
