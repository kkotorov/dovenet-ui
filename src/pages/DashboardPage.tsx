import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import '../i18n'; // import your i18n config

interface UserData {
  username: string;
  email: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const res = await axios.get('http://localhost:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleLanguageClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageChange = (lang: 'en' | 'bg') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    setAnchorEl(null);
  };

  if (loading)
    return <CircularProgress sx={{ mt: 8, display: 'block', mx: 'auto' }} />;

  return (
    <Container sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar>{user?.username[0].toUpperCase()}</Avatar>
          <Typography variant="h5">{t('welcome', { username: user?.username })}</Typography>
        </Box>
        <Box>
          <IconButton color="primary" onClick={handleLanguageClick}>
            <LanguageIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => handleLanguageChange('en')}>English</MenuItem>
            <MenuItem onClick={() => handleLanguageChange('bg')}>Български</MenuItem>
          </Menu>

          <IconButton color="secondary" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3} justifyContent="start">
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ minHeight: 150 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('pigeons')}</Typography>
              <Typography>{t('manageYourPigeons')}</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/pigeons')}>
                {t('managePigeons')}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ minHeight: 150 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('profile')}</Typography>
              <Typography>{t('email', { email: user?.email })}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
