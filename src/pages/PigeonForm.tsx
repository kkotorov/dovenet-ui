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
import { useTranslation } from 'react-i18next';
import '../i18n'; // your i18n config

interface PigeonFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function PigeonForm({ open, onClose, onSubmit, initialData }: PigeonFormProps) {
  const { t } = useTranslation();

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
      <DialogTitle>{initialData ? t('updatePigeon') : t('createPigeon')}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label={t('ringNumber')}
          name="ringNumber"
          value={pigeon.ringNumber}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label={t('name')}
          name="name"
          value={pigeon.name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label={t('color')}
          name="color"
          value={pigeon.color}
          onChange={handleChange}
        />

        {/* Gender Dropdown */}
        <TextField
          select
          fullWidth
          margin="dense"
          label={t('gender')}
          name="gender"
          value={pigeon.gender}
          onChange={handleChange}
        >
          <MenuItem value="male">{t('male')}</MenuItem>
          <MenuItem value="female">{t('female')}</MenuItem>
        </TextField>

        {/* Status Dropdown */}
        <TextField
          select
          fullWidth
          margin="dense"
          label={t('status')}
          name="status"
          value={pigeon.status}
          onChange={handleChange}
        >
          <MenuItem value="alive">{t('alive')}</MenuItem>
          <MenuItem value="deceased">{t('deceased')}</MenuItem>
          <MenuItem value="sold">{t('sold')}</MenuItem>
        </TextField>

        <TextField
          fullWidth
          margin="dense"
          type="date"
          label={t('birthDate')}
          name="birthDate"
          value={pigeon.birthDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          margin="dense"
          label={t('fatherRingNumber')}
          name="fatherRingNumber"
          value={pigeon.fatherRingNumber}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label={t('motherRingNumber')}
          name="motherRingNumber"
          value={pigeon.motherRingNumber}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? t('update') : t('create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
