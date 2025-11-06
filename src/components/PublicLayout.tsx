// src/components/PublicLayout.tsx
import { AppBar, Toolbar, Typography, Button, MenuItem, Select, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, Outlet } from 'react-router-dom';
import i18n from '../i18n';
import { useState } from 'react';

export default function PublicLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');

  const handleLanguageChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const lang = e.target.value as string;
    setLanguage(lang);
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">{t('appName')}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Select
              value={language}
              onChange={handleLanguageChange}
              sx={{
                color: 'white',
                borderColor: 'white',
                '& .MuiSvgIcon-root': { color: 'white' },
              }}
            >
              <MenuItem value="en">
                <span style={{ marginRight: 8 }}>🇬🇧</span> English
              </MenuItem>
              <MenuItem value="bg">
                <span style={{ marginRight: 8 }}>🇧🇬</span> Български
              </MenuItem>
            </Select>
            <Button color="inherit" onClick={() => navigate('/login')}>
              {t('login')}
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              {t('register')}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Render the actual page */}
      <Outlet />
    </>
  );
}

