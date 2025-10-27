import { useEffect, useState } from 'react';
import { Container, Typography, Button, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UserData {
  username: string;
  email: string;
  // add more fields if your backend provides them
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <CircularProgress sx={{ mt: 8, display: 'block', mx: 'auto' }} />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>
        Welcome, {user?.username}!
      </Typography>
      <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ mb: 4 }}>
        Logout
      </Button>
    
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Profile</Typography>
              <Typography>Email: {user?.email}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Statistics</Typography>
              <Typography>Coming soon… 📊</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Features</Typography>
              <Typography>Links to your tools here</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

        <Grid item xs={12} sm={6} md={4}>
            <Card>
                <CardContent>
                <Typography variant="h5">Pigeons</Typography>
                <Typography>Manage your pigeons</Typography>
                <Button 
                    variant="contained" 
                    sx={{ mt: 2 }} 
                    onClick={() => navigate('/pigeons')}
                >
                    Manage Pigeons
                </Button>
                </CardContent>
            </Card>
        </Grid>
      
    </Container>
  );
}
