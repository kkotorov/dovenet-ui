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
  Tooltip,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PigeonForm from './PigeonForm';
import { Edit, Delete } from '@mui/icons-material'; // import icons


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
  const { t } = useTranslation();
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);
  const [highlightedParentIds, setHighlightedParentIds] = useState<number[]>([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchPigeons = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/pigeons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPigeons(res.data);
    } catch (err) {
      console.error(t('fetchFailed'), err);
    }
  };

  const createPigeon = async (pigeon: Pigeon) => {
    try {
      if (!token) throw new Error(t('notLoggedIn'));
      await axios.post('http://localhost:8080/api/pigeons', pigeon, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPigeons();
    } catch (err) {
      console.error(t('createFailed'), err);
    }
  };

  const updatePigeon = async (pigeon: Pigeon) => {
    try {
      if (!token) throw new Error(t('notLoggedIn'));
      if (!pigeon.id) throw new Error(t('idRequired'));

      await axios.patch(
        `http://localhost:8080/api/pigeons/${pigeon.id}`,
        pigeon,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPigeons();
    } catch (err) {
      console.error(t('updateFailed'), err);
    }
  };

  const deletePigeon = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/api/pigeons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPigeons();
    } catch (err) {
      console.error(t('deleteFailed'), err);
    }
  };

  const downloadPedigreePdf = async (id: number) => {
    try {
      if (!token) throw new Error(t('notLoggedIn'));

      const res = await axios.get(
        `http://localhost:8080/api/pigeons/${id}/pedigree/pdf`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pedigree_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(t('downloadFailed'), err);
    }
  };

  const fetchParents = async (id: number) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/pigeons/${id}/parents`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const parents: Pigeon[] = res.data;
      const parentIds = parents.map((p) => p.id!);
      setHighlightedParentIds(parentIds);

      setTimeout(() => setHighlightedParentIds([]), 5000);
    } catch (err) {
      console.error(t('fetchParentsFailed'), err);
      alert(t('fetchParentsFailed'));
    }
  };

  const handleEdit = (pigeon: Pigeon) => {
    setEditingPigeon(pigeon);
    setOpenForm(true);
  };

  const genderSymbol = (gender: string) => {
    if (!gender) return { symbol: "", color: "inherit" };
    const lower = gender.toLowerCase();
    if (lower === "male") return { symbol: "♂", color: "blue" };
    if (lower === "female") return { symbol: "♀", color: "pink" };
    return { symbol: "", color: "inherit" };
  };

  useEffect(() => {
    fetchPigeons();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          {t('managePigeons')} 🕊️
        </Typography>

        <Box display="flex" gap={2}>
          <Button variant="outlined" color="primary" onClick={() => navigate('/dashboard')}>
            ← {t('backToDashboard')}
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditingPigeon(null);
              setOpenForm(true);
            }}
          >
            + {t('createPigeon')}
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f7fa' }}>
            <TableRow>
              <TableCell>{t('id')}</TableCell>
              <TableCell>{t('ringNumber')}</TableCell>
              <TableCell>{t('name')}</TableCell>
              <TableCell>{t('color')}</TableCell>
              <TableCell>{t('gender')}</TableCell>
              <TableCell>{t('status')}</TableCell>
              <TableCell>{t('birthDate')}</TableCell>
              <TableCell align="center">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pigeons.map((p) => (
              <TableRow
                key={p.id}
                hover
                sx={{
                  cursor: 'pointer',
                  '& td': {
                    backgroundColor: highlightedParentIds.includes(p.id!)
                      ? '#1fa13bff'
                      : 'inherit',
                    transition: 'background-color 0.3s ease',
                  },
                }}
                onClick={() => handleEdit(p)} // make row clickable
              >
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.ringNumber}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.color}</TableCell>
                <TableCell
                  sx={{
                    color: genderSymbol(p.gender).color,
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                  }}
                >
                  {genderSymbol(p.gender).symbol}
                </TableCell>
                <TableCell>{t(p.status)}</TableCell>
                <TableCell>{p.birthDate}</TableCell>
                <TableCell align="center">
                  {/* Edit icon */}
                <Tooltip title={t('editPigeon')}>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent row click
                      handleEdit(p);
                    }}
                  >
                    <Edit />
                  </Button>
                </Tooltip>

                  {/* Delete icon */}
                  <Tooltip title={t('deletePigeon')}>
                    <Button
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePigeon(p.id!);
                      }}
                    >
                      <Delete />
                    </Button>
                  </Tooltip>

                  {/* Pedigree PDF */}
                <Tooltip title={t('downloadPedigree')}>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPedigreePdf(p.id!);
                    }}
                  >
                    📄
                  </Button>
                </Tooltip>


                  {/* Parents */}
                <Tooltip title={t('getParents')}>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchParents(p.id!);
                    }}
                  >
                    👨‍👩‍👧
                  </Button>
                </Tooltip>
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
          onSubmit={(pigeon: Pigeon) => {
            if (editingPigeon?.id) {
              updatePigeon(pigeon);
            } else {
              createPigeon(pigeon);
            }
          }}
          initialData={editingPigeon || undefined}
        />
      )}
    </Container>
  );
}
