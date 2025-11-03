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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslation } from 'react-i18next';
import '../i18n';

interface UserData {
  username: string;
  email: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

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
        <IconButton color="secondary" onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </Box>
    <Grid container spacing={3} justifyContent="start">
      {/* Pigeons Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            minHeight: 180,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
          onClick={() => navigate('/pigeons')}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {t('pigeons')}
            </Typography>
            <Typography>{t('manageYourPigeons')}</Typography>
          </CardContent>
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ textTransform: 'none' }}
              onClick={() => navigate('/pigeons')}
            >
              {t('managePigeons')}
            </Button>
          </Box>
        </Card>
      </Grid>

              {/* Profile / Settings Card */}
            {/* Profile / Settings Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            minHeight: 180,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
          onClick={() => navigate('/settings')}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {t('profile')}
            </Typography>
            <Typography>
              {t('manageProfileText')} {/* <-- your new static text */}
            </Typography>
          </CardContent>
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ textTransform: 'none' }}
              onClick={(e) => {
                e.stopPropagation(); // prevent double navigation
                navigate('/settings');
              }}
            >
              {t('openSettings')}
            </Button>
          </Box>
        </Card>
      </Grid>

      </Grid>
    </Container>
  );
}
