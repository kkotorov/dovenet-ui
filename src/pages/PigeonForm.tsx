import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem
} from '@mui/material';

interface PigeonFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function PigeonForm({ open, onClose, onSubmit, initialData }: PigeonFormProps) {
  const [pigeon, setPigeon] = useState({
    ringNumber: '',
    name: '',
    color: '',
    gender: '',
    status: '',
    birthDate: '',
    fatherRingNumber: '',
    motherRingNumber: ''
  });

  useEffect(() => {
    if (initialData) setPigeon(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPigeon(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(pigeon);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialData ? 'Update Pigeon' : 'Create Pigeon'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Ring Number"
          name="ringNumber"
          value={pigeon.ringNumber}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Name"
          name="name"
          value={pigeon.name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Color"
          name="color"
          value={pigeon.color}
          onChange={handleChange}
        />

        {/* Gender Dropdown */}
        <TextField
          select
          fullWidth
          margin="dense"
          label="Gender"
          name="gender"
          value={pigeon.gender}
          onChange={handleChange}
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </TextField>

        {/* Status Dropdown */}
        <TextField
          select
          fullWidth
          margin="dense"
          label="Status"
          name="status"
          value={pigeon.status}
          onChange={handleChange}
        >
          <MenuItem value="alive">Alive</MenuItem>
          <MenuItem value="deceased">Deceased</MenuItem>
          <MenuItem value="sold">Sold</MenuItem>
        </TextField>

        <TextField
          fullWidth
          margin="dense"
          type="date"
          label="Birth Date"
          name="birthDate"
          value={pigeon.birthDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Father Ring Number"
          name="fatherRingNumber"
          value={pigeon.fatherRingNumber}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Mother Ring Number"
          name="motherRingNumber"
          value={pigeon.motherRingNumber}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
