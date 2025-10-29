import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PigeonForm from './PigeonForm'; // your modal/form component

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
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchPigeons = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/pigeons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPigeons(res.data);
    } catch (err) {
      console.error('Failed to fetch pigeons:', err);
    }
  };

  const createOrUpdatePigeon = async (pigeon: Pigeon) => {
    try {
      if (!token) throw new Error("Not logged in");

      if (pigeon.id) {
        const payload: Partial<Pigeon> = {};
        if (pigeon.name) payload.name = pigeon.name;
        if (pigeon.color) payload.color = pigeon.color;
        if (pigeon.gender) payload.gender = pigeon.gender;
        if (pigeon.status) payload.status = pigeon.status;
        if (pigeon.birthDate) payload.birthDate = pigeon.birthDate;
        if (pigeon.fatherRingNumber) payload.fatherRingNumber = pigeon.fatherRingNumber;
        if (pigeon.motherRingNumber) payload.motherRingNumber = pigeon.motherRingNumber;

        await axios.patch(`http://localhost:8080/api/pigeons/${pigeon.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:8080/api/pigeons', pigeon, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchPigeons();
    } catch (err) {
      console.error('Failed to create/update pigeon:', err);
    }
  };

  const deletePigeon = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/api/pigeons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPigeons();
    } catch (err) {
      console.error('Failed to delete pigeon:', err);
    }
  };

  const downloadPedigreePdf = async (id: number) => {
      try {
        if (!token) throw new Error("Not logged in");

        const res = await axios.get(`http://localhost:8080/api/pigeons/${id}/pedigree/pdf`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob', // important for binary files
        });

        // Create a link to download the PDF
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `pedigree_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error('Failed to download PDF:', err);
      }
  };

const [highlightedParentIds, setHighlightedParentIds] = useState<number[]>([]);

const fetchParents = async (id: number) => {
  try {
    const res = await axios.get(`http://localhost:8080/api/pigeons/${id}/parents`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const parents: Pigeon[] = res.data;
    const parentIds = parents.map((p) => p.id!);
    setHighlightedParentIds(parentIds);

    // Optional: clear the highlight after 5 seconds
    setTimeout(() => setHighlightedParentIds([]), 5000);
  } catch (err) {
    console.error('Failed to fetch parents:', err);
    alert('Failed to fetch parents.');
  }
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
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Manage Pigeons 🕊️
        </Typography>

        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditingPigeon(null);
              setOpenForm(true);
            }}
          >
            + Create Pigeon
          </Button>
        </Box>
      </Box>

      {/* Pigeons Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f7fa' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ring Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Birth Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pigeons.map((p) => (
                <TableRow
                  key={p.id}
                  sx={{
                    '& td': {
                      backgroundColor: highlightedParentIds.includes(p.id!)
                        ? '#1fa13bff' // light blue highlight for parent rows
                        : 'inherit',
                      transition: 'background-color 0.3s ease',
                    },
                  }}
                >
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.ringNumber}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.color}</TableCell>
                <TableCell>{p.gender}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>{p.birthDate}</TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleEdit(p)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => deletePigeon(p.id!)}
                  >
                    Delete
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"          // make it outlined like Edit/Delete
                    onClick={() => downloadPedigreePdf(p.id!)}
                    sx={{ ml: 1 }}              // margin-left for spacing
                  >
                    📄 Pedigree
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => fetchParents(p.id!)}
                    sx={{ ml: 1 }}
                  >
                    👨‍👩‍👧 Parents
                  </Button>


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
