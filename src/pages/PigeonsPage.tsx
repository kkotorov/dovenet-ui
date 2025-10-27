import { useEffect, useState } from 'react';
import { Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';
import PigeonForm from './PigeonForm'; // we’ll create this next

interface Pigeon {
  id?: number;
  ringNumber: string;
  name: string;
  color: string;
  gender: string;
  status: string;
  birthDate: string;
  fatherRingNumber?: string;
  motherRingNumber?: string;
}

export default function PigeonsPage() {
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);

  const token = localStorage.getItem('token');

  const fetchPigeons = async () => {
    const res = await axios.get('http://localhost:8080/api/pigeons', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPigeons(res.data);
  };

  const createOrUpdatePigeon = async (pigeon: Pigeon) => {
    if (pigeon.id) {
      await axios.patch(`http://localhost:8080/api/pigeons/${pigeon.id}`, pigeon, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post('http://localhost:8080/api/pigeons', pigeon, { headers: { Authorization: `Bearer ${token}` } });
    }
    fetchPigeons();
  };

  const deletePigeon = async (id: number) => {
    await axios.delete(`http://localhost:8080/api/pigeons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchPigeons();
  };

  const handleEdit = (pigeon: Pigeon) => {
    setEditingPigeon(pigeon);
    setOpenForm(true);
  };

  useEffect(() => {
    fetchPigeons();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Pigeons</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => { setEditingPigeon(null); setOpenForm(true); }}>
        Create Pigeon
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ring Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Birth Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pigeons.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.ringNumber}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.color}</TableCell>
                <TableCell>{p.gender}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>{p.birthDate}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(p)}>Edit</Button>
                  <Button color="error" onClick={() => deletePigeon(p.id!)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {openForm && (
        <PigeonForm 
          open={openForm} 
          onClose={() => setOpenForm(false)} 
          onSubmit={createOrUpdatePigeon} 
          initialData={editingPigeon || undefined} 
        />
      )}
    </Container>
  );
}
