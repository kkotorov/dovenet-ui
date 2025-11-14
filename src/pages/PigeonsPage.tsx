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
  IconButton
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PigeonForm from './PigeonForm';
import { Edit, Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material';

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
  const [sortField, setSortField] = useState<keyof Pigeon>('ringNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchPigeons = async () => {
    try {
      const res = await axios.get('https://api.dovenet.eu/api/pigeons', {
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
      await axios.post('https://api.dovenet.eu/api/pigeons', pigeon, {
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
        `https://api.dovenet.eu/api/pigeons/${pigeon.id}`,
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
      await axios.delete(`https://api.dovenet.eu/api/pigeons/${id}`, {
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
        `https://api.dovenet.eu/api/pigeons/${id}/pedigree/pdf`,
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
      const res = await axios.get(`https://api.dovenet.eu/api/pigeons/${id}/parents`, {
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
    if (!gender) return { symbol: '', color: 'inherit' };
    const lower = gender.toLowerCase();
    if (lower === 'male') return { symbol: '♂', color: 'blue' };
    if (lower === 'female') return { symbol: '♀', color: 'pink' };
    return { symbol: '', color: 'inherit' };
  };

  const handleSort = (field: keyof Pigeon) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedPigeons = [...pigeons].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: keyof Pigeon) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc'
      ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} />
      : <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />;
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
              {[
                ['id', t('id')],
                ['ringNumber', t('ringNumber')],
                ['name', t('name')],
                ['color', t('color')],
                ['gender', t('gender')],
                ['status', t('status')],
                ['birthDate', t('birthDate')]
              ].map(([key, label]) => (
                <TableCell
                  key={key}
                  onClick={() => handleSort(key as keyof Pigeon)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    userSelect: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Box display="flex" alignItems="center">
                    {label}
                    {getSortIcon(key as keyof Pigeon)}
                  </Box>
                </TableCell>
              ))}
              <TableCell align="center">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedPigeons.map((p) => (
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
                onClick={() => handleEdit(p)}
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
                  <Tooltip title={t('editPigeon')}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(p);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t('deletePigeon')}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePigeon(p.id!);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t('downloadPedigree')}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPedigreePdf(p.id!);
                      }}
                    >
                      📄
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t('getParents')}>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchParents(p.id!);
                      }}
                    >
                      👨‍👩‍👧
                    </IconButton>
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
